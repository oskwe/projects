from utils.database import get_collection


class BasisDocumentRepository:
    def __init__(self):
        self.collection = get_collection("basis_documents")

    def find_all(self):
        return list(self.collection.find())

    def find_one(self, id):
        return self.collection.find_one({"_id": id})

    def insert(self, basis_document):
        return self.collection.insert_one(basis_document)

    def replace(self, id, basis_document):
        return self.collection.replace_one({"_id": id}, basis_document)

    def delete(self, id):
        return self.collection.delete_one({"_id": id})
