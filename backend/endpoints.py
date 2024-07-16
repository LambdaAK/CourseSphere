import firebase_admin
from firebase_admin import credentials, auth, db
from firebase_admin import credentials, auth, db
from flask import Flask, request, jsonify
from flask_cors import CORS
from query_manager import QueryManager


firebase_credentials = credentials.Certificate("./credentials.json")
database_url = "https://coursesphere-8bd9a-default-rtdb.firebaseio.com"
firebase_admin.initialize_app(firebase_credentials, { "databaseURL": database_url })
firebase_app = firebase_admin.get_app()
app = Flask(__name__)
CORS(app)

app.register_blueprint(courses_bp)


def success_response(data: any, code: int):
    """
    Returns a success response with the given data and status code.

    :param data: The data to include in the response.
    :param code: The HTTP status code.
    :return: A Flask JSON response with the given data and status code.
    """
    return jsonify(data), code


def error_response(error: str, code: int):
    """
    Returns an error response with the given error message and status code.

    :param error: The error message to include in the response.
    :param code: The HTTP status code.
    :return: A Flask JSON response with the error message and status code.
    """
    return jsonify({'error': error}), code


@app.route("/users/create", methods=["POST"])
def create_user():
    """
    Creates a new user with the provided email and password.

    Expects a JSON payload in the request body with the following fields:
    - email: The email address of the user.
    - password: The password for the user's account.

    :return: A JSON response indicating the result of the user creation process.
             On success, returns a JSON response with the user data and a 200 status code.
             On failure, returns a JSON response with an error message and a 400 status code.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email:
        return error_response("Email is required", 400)
    if not password:
        return error_response("Password is required", 400)
    try:
        user = auth.create_user(
            email=email, password=password
        )  # FireBase Error OR ValueError
        user_data = {
            "message": "User created successfully",
            "user_id": user.uid,
            "email": user.email,
        }
        return success_response(user_data, 200)
    except Exception as e:
        return error_response(f"Error creating user: {str(e)}", 400)


@app.route("/users/info", methods=["POST"])
def set_user_info():
    """
    Sets user info with the provided info.

    Expects a JSON payload in the request body with the following fields:
    - majors: List of strings representing the user's majors.
    - minors: List of strings representing the user's minors.
    - year: Integer representing the user's academic year.
    - college: String representing the user's college.
    - courses: List of strings representing the user's courses.
    - about: String with additional information about the user.
    """
    
    # get the idtoken of the user
    data = request.get_json()
    id_token = data.get("id_token")
    uid = ""

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
    except Exception as e:
        return error_response(f"Error setting user info: {str(e)}", 400)
        
    majors = data.get("majors")
    minors = data.get("minors")
    year = data.get("year")
    college = data.get("college")
    courses = data.get("courses")
    about = data.get("about")

    # Set uid/info equal to the data
    user_info = {
        "majors": majors,
        "minors": minors,
        "year": year,
        "college": college,
        "courses": courses,
        "about": about
    }

    ref = db.reference(f"users/{uid}/info")
    ref.set(user_info)
    return success_response({"message": "User info set successfully", "uid": uid}, 200)


@app.route("/users/info", methods=["GET"])
def get_user_info():
    """
    Retrieves user information based on the provided ID token.

    Expects a query parameter `id_token` in the request.
    """
    # get the idtoken of the user and authenticate it

    id_token = request.args.get("id_token")
    uid = ""
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
    except Exception as e:
        return error_response(f"Error getting user info: {str(e)}", 400)
    ref = db.reference(f'users/{uid}/info')
    user_info = ref.get()
    return success_response(user_info, 200)

@app.route("/user/query", methods=["POST"])
def get_user_query():
    """
    Handles different types of user queries based on the 'query_type' field in the request body.
    """

    # Receive the query from the frontend, along with another generic error handling
    # Determine query type, and parse any other fields
    # Compose query_manager functions (or abstract that away within said file and make it a one-shot func call
    # Whatever else jerry / alex implemented
    # Return the results to the frontend

    try:
        query = 'hehe'
        qm = QueryManager(query)
        return success_response(qm.response, 200)
    except Exception as e:
        return error_response(f"Error getting generating query: {str(e)}", 400)



if __name__ == '__main__':
    app.run(debug=True)
