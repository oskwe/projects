from utils.database import get_collection


class PackageTypeRepository:
    def __init__(self):
        self.collection = get_collection("package_types")

    def find_all(self):
        return list(self.collection.find())

    def find_one(self, id):
        return self.collection.find_one({"_id": id})

    def insert(self, package_type):
        return self.collection.insert_one(package_type)

    def replace(self, id, package_type):
        return self.collection.replace_one({"_id": id}, package_type)

    def delete(self, id):
        return self.collection.delete_one({"_id": id})
