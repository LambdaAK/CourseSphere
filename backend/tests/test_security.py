"""Testes de regressão dos achados do SECURITY_REPORT.md.

Cada teste descreve o comportamento seguro esperado. Antes das correções
eles falham; depois, passam.
"""
import firebase
import endpoints
from firebase_admin import auth


# --- Achado: id_token na query string (vaza em logs de acesso) -------------

def _fake_verify(token):
    if token != "token-valido":
        raise Exception("token ausente ou invalido")
    return {"uid": "u1"}


def test_user_info_rejeita_token_na_query_string(client, monkeypatch):
    monkeypatch.setattr(firebase.Firebase, "verify_id_token", staticmethod(_fake_verify))
    monkeypatch.setattr(firebase.Firebase, "get_user_info", staticmethod(lambda uid: {"year": "2"}))

    resp = client.get("/users/info?id_token=token-valido")

    assert resp.status_code == 401


def test_user_info_aceita_token_no_header_authorization(client, monkeypatch):
    monkeypatch.setattr(firebase.Firebase, "verify_id_token", staticmethod(_fake_verify))
    monkeypatch.setattr(firebase.Firebase, "get_user_info", staticmethod(lambda uid: {"year": "2"}))

    resp = client.get("/users/info", headers={"Authorization": "Bearer token-valido"})

    assert resp.status_code == 200
    assert resp.get_json() == {"year": "2"}


# --- Achado: vazamento de detalhes internos nas mensagens de erro ----------

def test_erro_interno_nao_vaza_detalhes_ao_cliente(client, monkeypatch):
    def boom(**kwargs):
        raise Exception(
            "Failed to establish a connection: HTTPConnectionPool("
            "host='127.0.0.1', port=9099) /identitytoolkit.googleapis.com/v1/projects/demo-coursesphere"
        )

    monkeypatch.setattr(auth, "create_user", boom)

    resp = client.post("/users/create", json={"email": "a@b.com", "password": "123456"})

    corpo = resp.get_data(as_text=True)
    assert resp.status_code == 500
    for segredo in ("127.0.0.1", "9099", "HTTPConnectionPool", "identitytoolkit", "demo-coursesphere"):
        assert segredo not in corpo


def test_email_ja_cadastrado_continua_com_mensagem_util(client, monkeypatch):
    def duplicado(**kwargs):
        raise auth.EmailAlreadyExistsError("interno", None, None)

    monkeypatch.setattr(auth, "create_user", duplicado)

    resp = client.post("/users/create", json={"email": "a@b.com", "password": "123456"})

    assert resp.status_code == 400
    assert resp.get_json() == {"error": "Email already in use"}


def test_token_invalido_retorna_401_sem_detalhes(client, monkeypatch):
    def invalido(token):
        raise auth.InvalidIdTokenError("detalhe interno do SDK")

    monkeypatch.setattr(auth, "verify_id_token", invalido)

    resp = client.get("/users/info", headers={"Authorization": "Bearer lixo"})

    assert resp.status_code == 401
    assert "SDK" not in resp.get_data(as_text=True)


# --- Achado: depurador Werkzeug e CORS abertos ------------------------------

def test_debug_desligado_por_padrao(monkeypatch):
    monkeypatch.delenv("FLASK_DEBUG", raising=False)
    assert endpoints.is_debug_enabled() is False


def test_debug_so_liga_com_variavel_explicita(monkeypatch):
    monkeypatch.setenv("FLASK_DEBUG", "1")
    assert endpoints.is_debug_enabled() is True


def test_cors_nao_aceita_origem_desconhecida(client):
    resp = client.options(
        "/users/info",
        headers={"Origin": "https://site-malicioso.example", "Access-Control-Request-Method": "GET"},
    )
    assert resp.headers.get("Access-Control-Allow-Origin") is None


def test_cors_aceita_origem_do_frontend(client):
    resp = client.options(
        "/users/info",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
    )
    assert resp.headers.get("Access-Control-Allow-Origin") == "http://localhost:5173"
