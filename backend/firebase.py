# firebase.py
import os
import firebase_admin
from firebase_admin import credentials, auth, db


def _init_firebase_app():
    """
    Inicializa o Firebase Admin SDK.

    - Padrão (produção): usa credentials.json e o banco original, como antes.
    - Com FIREBASE_AUTH_EMULATOR_HOST definido: usa os emuladores locais,
      sem credencial real.
    """
    if os.environ.get("FIREBASE_AUTH_EMULATOR_HOST"):
        project_id = os.environ.get("GCLOUD_PROJECT", "demo-coursesphere")
        options = {
            "projectId": project_id,
            "databaseURL": f"https://{project_id}-default-rtdb.firebaseio.com",
        }
        return firebase_admin.initialize_app(options=options)

    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "./credentials.json")
    options = {
        "databaseURL": os.environ.get(
            "FIREBASE_DATABASE_URL",
            "https://coursesphere-8bd9a-default-rtdb.firebaseio.com",
        )
    }
    return firebase_admin.initialize_app(credentials.Certificate(cred_path), options)


firebase_app = _init_firebase_app()


class PublicError(Exception):
    """Erro cujo texto é seguro para devolver ao cliente (sem detalhes internos)."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status

class Firebase:
    @staticmethod
    def create_user(email: str, password: str):
        try:
            user = auth.create_user(email=email, password=password)
            user_data = {
            "message": "User created successfully",
            "user_id": user.uid,
            "email": user.email,
            } 
            return user_data
        except auth.EmailAlreadyExistsError as e:
            raise PublicError("Email already in use", 400) from e
        except ValueError as e:
            raise PublicError("Invalid email or password", 400) from e
        except Exception as e:
            raise Exception("Error creating user") from e
        
    @staticmethod
    def delete_user(uid: str):
        try:
            auth.delete_user(uid)
            ref = db.reference(f"users/{uid}")
            ref.delete()
        except Exception as e:
            raise Exception(f"Error deleting user: {str(e)}")

    @staticmethod
    def verify_id_token(id_token: str):
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except (
            auth.InvalidIdTokenError,
            auth.ExpiredIdTokenError,
            auth.RevokedIdTokenError,
            ValueError,
        ) as e:
            raise PublicError("Invalid or expired token", 401) from e
        except Exception as e:
            raise Exception("Error verifying ID token") from e

    @staticmethod
    def set_user_info(uid: str, user_info: dict):
        try:
            ref = db.reference(f"users/{uid}/info")
            ref.set(user_info)
        except Exception as e:
            raise Exception(f"Error setting user info: {str(e)}")

    @staticmethod
    def get_user_info(uid: str):
        try:
            ref = db.reference(f"users/{uid}/info")
            user_info = ref.get()
            return user_info
        except Exception as e:
            raise Exception(f"Error getting user info: {str(e)}")
        
    @staticmethod
    def try_get_user_info(id_token):
        try:
            return Firebase.get_user_info(Firebase.verify_id_token(id_token).get('uid'))
        except Exception:
            return None



    @staticmethod
    def update_user_info(uid: str, updates: dict):
        try:
            ref = db.reference(f"users/{uid}/info")
            ref.update(updates)
        except Exception as e:
            raise Exception(f"Error updating user info: {str(e)}")
    
    @staticmethod
    def create_document(collection: str, document_id: str, data: dict):
        """
        Creates a document in a specified collection.
        
        :param collection: The name of the collection.
        :param document_id: The ID of the document to create.
        :param data: A dictionary of the data to store in the document.
        """
        try:
            ref = db.reference(f"{collection}/{document_id}")
            ref.set(data)
        except Exception as e:
            raise Exception(f"Error creating document: {str(e)}")

    @staticmethod
    def get_document(collection: str, document_id: str):
        """
        Retrieves a document from a specified collection.
        
        :param collection: The name of the collection.
        :param document_id: The ID of the document to retrieve.
        :return: The document data as a dictionary.
        """
        try:
            ref = db.reference(f"{collection}/{document_id}")
            document = ref.get()
            return document
        except Exception as e:
            raise Exception(f"Error retrieving document: {str(e)}")

    @staticmethod
    def update_document(collection: str, document_id: str, updates: dict):
        """
        Updates a document in a specified collection.
        
        :param collection: The name of the collection.
        :param document_id: The ID of the document to update.
        :param updates: A dictionary of the updates to apply to the document.
        """
        try:
            ref = db.reference(f"{collection}/{document_id}")
            ref.update(updates)
        except Exception as e:
            raise Exception(f"Error updating document: {str(e)}")

    @staticmethod
    def delete_document(collection: str, document_id: str):
        """
        Deletes a document from a specified collection.
        
        :param collection: The name of the collection.
        :param document_id: The ID of the document to delete.
        """
        try:
            ref = db.reference(f"{collection}/{document_id}")
            ref.delete()
        except Exception as e:
            raise Exception(f"Error deleting document: {str(e)}")
        

    @staticmethod
    def save_chat(uid: str, chat_id: str, messages: list):
        try:
            ref = db.reference(f"users/{uid}/chats/{chat_id}/messages")
            
            # Ensure messages is a list of dictionaries
            if isinstance(messages, list):
                for message in messages:
                    if isinstance(message, dict):
                        ref.push(message)  # Add each message to the Firebase database
                    else:
                        raise ValueError("Each message must be a dictionary.")
            else:
                raise ValueError("Messages must be a list of dictionaries.")
        except Exception as e:
            raise Exception(f"Error saving messages: {str(e)}")

    @staticmethod
    def delete_chat(uid: str, chat_id: str):
        try:
            ref = db.reference(f"users/{uid}/chats/{chat_id}")
            ref.delete()  # Deletes the entire chat session
        except Exception as e:
            raise Exception(f"Error deleting chat session: {str(e)}")
