import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from query_manager import QueryManager
from firebase import Firebase, PublicError
from main import hashFunction

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("coursesphere")

def apply_proxy_fix(flask_app, enabled=None):
    """Confia nos headers X-Forwarded-* SOMENTE quando há um proxy reverso na frente.

    Atrás do Nginx, sem isso todos os clientes pareceriam ter o IP do proxy e
    dividiriam o mesmo contador de rate limit. Ligar TRUST_PROXY=1 sem proxy é
    perigoso: o cliente poderia forjar o próprio IP e escapar do limite.
    """
    if enabled is None:
        enabled = os.environ.get("TRUST_PROXY", "0") == "1"
    if enabled:
        flask_app.wsgi_app = ProxyFix(flask_app.wsgi_app, x_for=1, x_proto=1, x_host=0)
    return flask_app


def is_debug_enabled() -> bool:
    """O depurador do Werkzeug só liga se FLASK_DEBUG=1 for definido de forma explícita."""
    return os.environ.get("FLASK_DEBUG", "0") == "1"


# Origens do frontend autorizadas a chamar a API pelo navegador (lista separada por vírgula).
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app = Flask(__name__)
CORS(app, origins=ALLOWED_ORIGINS)
apply_proxy_fix(app)

# Rate limiting por IP. O contador fica na memória de cada processo; com várias
# instâncias, aponte RATELIMIT_STORAGE_URI para um Redis compartilhado.
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per minute"],
    storage_uri=os.environ.get("RATELIMIT_STORAGE_URI", "memory://"),
)

# TODO: figure out the blueprint thing below
#app.register_blueprint(courses_bp)

success_response = lambda data, code: (jsonify(data), code)
error_response = lambda error, code: (jsonify({'error': error}), code)


def handle_error(context: str, exc: Exception):
    """Resposta de erro segura: detalhes internos vão para o log, não para o cliente."""
    if isinstance(exc, PublicError):
        return error_response(exc.message, exc.status)
    logger.error("%s failed", context, exc_info=exc)
    return error_response("Internal server error", 500)


def bearer_token() -> str:
    """Extrai o token do header 'Authorization: Bearer <token>'.

    O token nunca deve trafegar na URL: query strings são gravadas em logs de
    acesso, proxies e histórico do navegador.
    """
    scheme, _, token = request.headers.get("Authorization", "").partition(" ")
    if scheme != "Bearer" or not token.strip():
        raise PublicError("Authentication required", 401)
    return token.strip()

@app.route("/users/create", methods=["POST"])
@limiter.limit("5 per minute")
def create_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email:
        return error_response("Email is required", 400)
    if not password:
        return error_response("Password is required", 400)
    try:
        return success_response(Firebase.create_user(email, password), 200)
    except Exception as e:
        return handle_error("create_user", e)

@app.route("/users/info", methods=["POST"])
def set_user_info(): 
    data = request.get_json()
    id_token = data.get("id_token")
    try:
        uid = Firebase.verify_id_token(id_token).get('uid')
        majors = data.get("majors")
        minors = data.get("minors")
        year = data.get("year")
        college = data.get("college")
        courses = data.get("courses")
        about = data.get("about")
        user_info = {
            "majors": majors,
            "minors": minors,
            "courses": courses,
            "college": college,
            "year": year,
            "about": about
        }
        Firebase.set_user_info(uid, user_info) 
        return success_response({"message": "User info set successfully", "uid": uid}, 200)
    except Exception as e:
        return handle_error("set_user_info", e)
        
@app.route("/users/info", methods=["GET"])
def get_user_info(id_token=None): # I use this function below in a different context, hence id_token optionally equal to None. 
    try:
        id_token = id_token if id_token is not None else bearer_token()
        uid = Firebase.verify_id_token(id_token).get('uid') # !!!
        user_info = Firebase.get_user_info(uid)
        return success_response(user_info, 200)
    except Exception as e:
        return handle_error("get_user_info", e)
  
@app.route("/users/query", methods=["POST"])
@limiter.limit("20 per minute")
def get_user_query():
    try:
        query = request.get_json().get("query")
        user_info = Firebase.try_get_user_info(request.get_json().get("id_token"))
        return success_response(QueryManager(query, user_info).response, 200)
    except Exception as e:
        return handle_error("get_user_query", e)

@app.route('/hash', methods=['POST'])
@limiter.limit("60 per minute")
def generate_message_id():
    try:
        id_token = bearer_token()
        Firebase.verify_id_token(id_token).get('uid')
        data = request.get_json()  
        message_id = hashFunction(data)
        return jsonify({'messageID': message_id}), 200  
    except Exception as e:
        return handle_error("generate_message_id", e)

@app.route("/chats/<chat_id>/messages", methods=["POST"])
def save_chat(chat_id):
    try:
        id_token = bearer_token()
        user_id = Firebase.verify_id_token(id_token).get('uid')
        messages = request.get_json().get('messages', [])
        Firebase.save_chat(user_id, chat_id, messages)
        return jsonify({'message': 'Messages saved successfully'}), 200
    except Exception as e:
        return handle_error("save_chat", e)

@app.route("/chats/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    try:
        id_token = bearer_token()
        user_id = Firebase.verify_id_token(id_token).get('uid')
        Firebase.delete_chat(user_id, chat_id)
        return success_response({'message': 'Message deleted successfully'}, 200)
    except Exception as e:
        return handle_error("delete_chat", e)


@app.route("/health", methods=["GET"])
@limiter.exempt
def health():
    """Liveness: o processo está de pé e respondendo (não consome rate limit)."""
    return jsonify({"status": "ok"}), 200


@app.errorhandler(429)
def too_many_requests(e):
    return error_response("Too many requests", 429)


@app.after_request
def add_security_headers(response):
    """Headers de segurança em todas as respostas da API."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    response.headers["Cache-Control"] = "no-store"
    # HSTS só faz sentido sobre HTTPS (atrás de proxy, o Nginx informa o esquema).
    if request.is_secure or request.headers.get("X-Forwarded-Proto", "").lower() == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


if __name__ == '__main__':
    app.run(host=os.environ.get("HOST", "127.0.0.1"), debug=is_debug_enabled())
