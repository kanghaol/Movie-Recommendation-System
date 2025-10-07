import os
from pymongo import MongoClient

# Allow overriding Mongo connection via env var for docker-compose or other deployments
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)
db = client.get_database(os.environ.get("MONGO_DB", "MovieRecommendations"))
movieCollection = db["movies_metadata"]
userCollection = db["user"]
