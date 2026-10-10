from utils.database import get_collection


class Torg12FullRepository:
    def __init__(self):
        self.collection = get_collection("full_documents")

    def insert(self, data):
        return self.collection.insert_one(data)

    def replace(self, id, data):
        return self.collection.replace_one({"_id": id}, data)

    def delete(self, id):
        return self.collection.delete_one({"_id": id})
