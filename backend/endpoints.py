import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, request, render_template, jsonify
import json
from flask_cors import CORS

cred = credentials.Certificate("./credentials.json")
firebase_admin.initialize_app(cred) 

firebase_app = firebase_admin.get_app()


app = Flask(__name__)

CORS(app)


# Generic response functions, change as needed for the frontend. 
def success_response(message: str, code: int):
    
    response = {
        'status': 'success',
        'message': message
    }
    return jsonify(response), code

def error_response(error: str, code: int):
   
    response = {
        'status': 'error',
        'message': error
    }
    return jsonify(response), code



def create_user(email: str, password: str):
  user = auth.create_user(
    email=email,
    password=password
  )

  return user


@app.route('/users/create', methods=["POST"])
def users_create():
  print("users/create")
  data = request.get_json()
  # get the email and password from the request

  email = data.get("email")
  password = data.get("password")

  response = {}

  if not email:
    response["error"] = "Email is required"
    return response, 400
  if not password:
    response["error"] = "Password is required"
    return response, 400
  
  try:
    create_user(email, password)

  except Exception as e:
    response["error"] = str(e)
    return response, 400

  response["message"] = "User created successfully"

  return response, 200


if __name__ == '__main__':
    app.run(debug=True)