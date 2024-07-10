import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, request, jsonify
from flask_cors import CORS

# Firebase Initialization
cred = credentials.Certificate("./credentials.json")
firebase_admin.initialize_app(cred)
firebase_app = firebase_admin.get_app()

# Cross Origin Resolution
app = Flask(__name__)
CORS(app)


def success_response(data: any, code: int):
    """
    Returns a success response with the given data and status code.

    :param data: The data to include in the response.
    :param code: The HTTP status code.
    :return: A Flask JSON response with the given data and status code.
    """
    print(data)  #testing
    return jsonify(data), code


def error_response(error: str, code: int):
    """
    Returns an error response with the given error message and status code.

    :param error: The error message to include in the response.
    :param code: The HTTP status code.
    :return: A Flask JSON response with the error message and status code.
    """
    print(error)  #also testing
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
        user = auth.create_user(email=email, password=password)  # FireBase Error OR ValueError
        user_data = {
            'message': "User created successfully",
            'user_id': user.uid,
            'email': user.email
        }
        return success_response(user_data, 200)
    except Exception as e:
        return error_response(f"Error creating user: {str(e)}", 400)

@app.route("/users/info", methods=["POST"])
def set_user_info():
    pass




if __name__ == '__main__':
    app.run(debug=True)
