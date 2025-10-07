
from flask import request, make_response, jsonify
import bcrypt
import hashlib
import secrets
import re

from config import userCollection


def is_valid_email(email):
    email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_pattern, email)


def register():
    try:
        newUserDat = request.get_json()
            
        email = newUserDat.get("email", "")
        username = newUserDat.get("username", "")
        password = newUserDat.get("password", "")
        passwordConfirm = newUserDat.get("confirmPassword", "")

        if email == "" or username == "" or password == "" or passwordConfirm == "":
            print("EMPTY FIELDS")
            return jsonify({'message_fields': "Fields can't be left empty."}), 400
        
        if not is_valid_email(email):
            return jsonify({"message_email": "Invalid email format."}), 400

        findDupName = userCollection.find_one({"username": username})
        findDupEmail = userCollection.find_one({"email": email})
        
        if findDupEmail:
            return jsonify({"message_email": "Email already in use. Please choose another one."}), 400
        
        if findDupName: 
            return jsonify({"message_username": "Username already exist. Please try another name."}), 400
        
        if password != passwordConfirm:
            return jsonify({"message_password": "Passwords do not match."}), 400
        
        
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        userCollection.insert_one({
            "email": email,
            "username": username, 
            "password": hashed_password, 
            "salt": salt, 
            "likes": [],
            'dislikes': [],
            })

        return make_response()
    except Exception as e:
        print(e)
        return jsonify({'message': 'An error occurred'}), 500

def login():
    try:
        requestData = request.get_json()
        username = requestData.get("username")
        userPassword = requestData.get("password")

        if not username or not userPassword:
            return jsonify({'message_required': 'Username and password are required.'}), 400

        userRecord = userCollection.find_one({"username": username})

        if userRecord:
            salt = userRecord["salt"]
            hashedPassword = bcrypt.hashpw(userPassword.encode(), salt)

            if hashedPassword == userRecord["password"]:
                # Generate auth token and hashed token for database storage
                token = secrets.token_hex()
                hashedToken = hashlib.sha256(token.encode("utf-8")).hexdigest()

                # Set the auth token as a secure, HttpOnly cookie
                response = make_response(jsonify({'message': 'Login successful'}))
                response.set_cookie("authToken", value=token, max_age=3600, httponly=True, secure=True)

                # Update user record in MongoDB with the hashed token
                userCollection.update_one(
                    {"username": username},
                    {"$set": {"token": hashedToken}}
                )
                return response
            else:
                return jsonify({'message_invalid': 'Invalid username or password.'}), 400
        else:
            return jsonify({'message_invalid': 'Invalid username or password.'}), 400

    except Exception as e: 
        return jsonify({'message': 'An error occurred'}), 500

    