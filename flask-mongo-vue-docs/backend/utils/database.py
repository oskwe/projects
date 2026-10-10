from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]

def get_collection(collection: str):
    return db[collection]
