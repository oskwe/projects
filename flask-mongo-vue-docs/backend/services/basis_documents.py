from bson import ObjectId

from repositories.basis_documents import BasisDocumentRepository
from utils.error_handler import ErrorHandler


class BasisDocumentService:
    DEFAULT_BASIS_DOCUMENTS = [
        "Договор поставки",
        "Счет",
        "Заказ покупателя",
        "Спецификация",
        "Заявка"
    ]

    def __init__(self):
        self.repository = BasisDocumentRepository()
        self.error_handler = ErrorHandler()

    def get_all(self):
        self._ensure_defaults()
        return self.repository.find_all()

    def _ensure_defaults(self):
        if self.repository.find_all():
            return
        for title in self.DEFAULT_BASIS_DOCUMENTS:
            self.repository.insert({"title": title})

    def get_one(self, id):
        self.error_handler.validate_object_id(id)
        return self.repository.find_one(ObjectId(id))

    def create(self, data):
        self.error_handler.validate_required_fields(data, ["title"])
        self.error_handler.validate_string_field(data["title"], "title")

        result = self.repository.insert({"title": data["title"].strip()})
        return {"_id": result.inserted_id}

    def update(self, data):
        self.error_handler.validate_required_fields(data, ["_id", "title"])
        self.error_handler.validate_object_id(data["_id"])
        self.error_handler.validate_string_field(data["title"], "title")

        result = self.repository.replace(ObjectId(data["_id"]), {"title": data["title"].strip()})
        self.error_handler.validate_document(result.matched_count)
        return {"success": True}

    def delete(self, id):
        self.error_handler.validate_object_id(id)
        result = self.repository.delete(ObjectId(id))
        self.error_handler.validate_document(result.deleted_count)
        return {"success": True}
