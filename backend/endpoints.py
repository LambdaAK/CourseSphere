from flask import Flask, request, jsonify
from flask_cors import CORS
from query_manager import QueryManager
from firebase import Firebase
from main import hashFunction

app = Flask(__name__)
CORS(app)

# TODO: figure out the blueprint thing below
#app.register_blueprint(courses_bp)

success_response = lambda data, code: (jsonify(data), code)
error_response = lambda error, code: (jsonify({'error': error}), code)

@app.route("/users/create", methods=["POST"])
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
        return error_response(f"Error creating user: {str(e)}", 400)

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
        return error_response(f"Error with setting user info: {str(e)}", 400)
        
@app.route("/users/info", methods=["GET"])
def get_user_info(id_token=None): # I use this function below in a different context, hence id_token optionally equal to None. 
    try:
        id_token = id_token if id_token is not None else request.args.get("id_token")
        uid = Firebase.verify_id_token(id_token).get('uid') # !!!
        user_info = Firebase.get_user_info(uid)
        return success_response(user_info, 200)
    except Exception as e:
        return error_response(f"Error getting user info: {str(e)}", 400)
  
@app.route("/users/query", methods=["POST"])
def get_user_query():
    try:
        query = request.get_json().get("query")
        user_info = Firebase.try_get_user_info(request.get_json().get("id_token"))
        return success_response(QueryManager(query, user_info).response, 200)
    except Exception as e:
        return error_response(f"Error getting generating query: {str(e)}", 400)

@app.route('/hash', methods=['POST'])
def generate_message_id():
    try:
        id_token = request.headers.get('Authorization').split('Bearer ')[1]
        Firebase.verify_id_token(id_token).get('uid')
        data = request.get_json()  
        message_id = hashFunction(data)
        return jsonify({'messageID': message_id}), 200  
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/chats/<chat_id>/messages", methods=["POST"])
def save_chat(chat_id):
    try:
        id_token = request.headers.get('Authorization').split('Bearer ')[1]
        user_id = Firebase.verify_id_token(id_token).get('uid')
        messages = request.get_json().get('messages', [])
        Firebase.save_chat(user_id, chat_id, messages)
        return jsonify({'message': 'Messages saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': f"Error saving messages: {str(e)}"}), 400

@app.route("/chats/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    try:
        id_token = request.headers.get("Authorization").split("Bearer ")[1]
        user_id = Firebase.verify_id_token(id_token).get('uid')
        Firebase.delete_chat(user_id, chat_id)
        return success_response({'message': 'Message deleted successfully'}, 200)
    except Exception as e:
        return error_response(f"Error deleting message: {str(e)}", 400)


if __name__ == '__main__':
    app.run(debug=True)
