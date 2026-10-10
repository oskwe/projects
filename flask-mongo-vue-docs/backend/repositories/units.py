from utils.database import get_collection


class UnitRepository:
    def __init__(self):
        self.collection = get_collection("units")

    def find_all(self):
        return list(self.collection.find())

    def find_one(self, id):
        return self.collection.find_one({"_id": id})

    def insert(self, unit):
        return self.collection.insert_one(unit)

    def replace(self, id, unit):
        return self.collection.replace_one({"_id": id}, unit)

    def delete(self, id):
        return self.collection.delete_one({"_id": id})
