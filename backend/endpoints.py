
from flask import Flask, request, jsonify
from flask_cors import CORS
from query_manager import QueryManager
from backend.firebase import Firebase


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
        uid = Firebase.verify_id_token(id_token).get('uid') # !!!
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
        Firebase.set_user_info(uid, user_info) # !!! 
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
    query = request.get_json().get("query")
    id_token = request.get_json().get("id_token")
    user_info = Firebase.try_get_user_info(id_token)
    try:
        return success_response(QueryManager(query, user_info).response, 200)
    except Exception as e:
        return error_response(f"Error getting generating query: {str(e)}", 400)

@app.route()
def save_chat():
    pass

app.route()
def update_chat():
    pass

@app.route()
def delete_chat():
    pass
    
if __name__ == '__main__':
    app.run(debug=True)
