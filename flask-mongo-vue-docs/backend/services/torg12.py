from bson import ObjectId
from datetime import datetime

from repositories.torg12 import Torg12Repository
from repositories.torg12_full import Torg12FullRepository
from utils.error_handler import ErrorHandler


class Torg12Service:
    def __init__(self):
        self.repository = Torg12Repository()
        self.full_repository = Torg12FullRepository()
        self.error_handler = ErrorHandler()

    def get_all(self):
        return self.repository.find_all()

    def get_one(self, id):
        self.error_handler.validate_object_id(id)
        document = self.repository.find_one(ObjectId(id))
        self.error_handler.validate_document(1 if document else 0)
        return document

    def _validate_payload(self, data, with_id=False):
        required = [
            "number",
            "date",
            "shipper_organization",
            "consignee_organization",
            "supplier_organization",
            "payer_organization",
            "transport_invoice",
            "operation_type",
            "items"
        ]
        if with_id:
            required = ["_id"] + required
        self.error_handler.validate_required_fields(data, required)
        self.error_handler.validate_string_field(data["number"], "number")
        self.error_handler.validate_date_field(data["date"], "date")
        self.error_handler.validate_object_id(data["shipper_organization"])
        self.error_handler.validate_object_id(data["consignee_organization"])
        self.error_handler.validate_object_id(data["supplier_organization"])
        self.error_handler.validate_object_id(data["payer_organization"])
        self.error_handler.validate_string_field(data["operation_type"], "operation_type")
        self.error_handler.validate_required_fields(data["transport_invoice"], ["number", "date"])
        if not isinstance(data["transport_invoice"]["number"], str):
            raise ValueError("transport_invoice.number must be a string")
        if data["transport_invoice"]["date"] and not isinstance(data["transport_invoice"]["date"], str):
            raise ValueError("transport_invoice.date must be a string")
        if data["transport_invoice"]["date"]:
            self.error_handler.validate_date_field(data["transport_invoice"]["date"], "transport_invoice.date")

        for row in data["items"]:
            self.error_handler.validate_required_fields(row, [
                "item",
                "unit",
                "package_type",
                "quantity",
                "places",
                "gross_weight",
                "net_weight",
                "price",
                "vat_percent"
            ])
            self.error_handler.validate_object_id(row["item"])
            self.error_handler.validate_object_id(row["unit"])
            self.error_handler.validate_object_id(row["package_type"])
            self.error_handler.validate_int_field(row["quantity"], "items.quantity")
            self.error_handler.validate_int_field(row["places"], "items.places")
            self.error_handler.validate_int_field(row["gross_weight"], "items.gross_weight")
            self.error_handler.validate_int_field(row["net_weight"], "items.net_weight")
            self.error_handler.validate_int_field(row["price"], "items.price")
            self.error_handler.validate_int_field(row["vat_percent"], "items.vat_percent")

        if with_id:
            self.error_handler.validate_object_id(data["_id"])

    def _normalize_transport_invoice(self, transport_invoice):
        number = (transport_invoice.get("number") or "").strip()
        date = (transport_invoice.get("date") or "").strip()
        return {
            "number": number,
            "date": datetime.strptime(date, "%Y-%m-%d") if date else None
        }

    def _normalize_items(self, rows):
        normalized = []
        for row in rows:
            amount_wo_vat = int(row["quantity"]) * int(row["price"])
            vat_amount = int(round(amount_wo_vat * int(row["vat_percent"]) / 100))
            normalized.append({
                "item": ObjectId(row["item"]),
                "unit": ObjectId(row["unit"]),
                "package_type": ObjectId(row["package_type"]),
                "quantity": int(row["quantity"]),
                "places": int(row["places"]),
                "gross_weight": int(row["gross_weight"]),
                "net_weight": int(row["net_weight"]),
                "price": int(row["price"]),
                "vat_percent": int(row["vat_percent"]),
                "amount_without_vat": amount_wo_vat,
                "vat_amount": vat_amount,
                "amount_with_vat": amount_wo_vat + vat_amount
            })
        return normalized

    def create(self, data):
        self._validate_payload(data, with_id=False)

        document = {
            "number": data["number"].strip(),
            "date": datetime.strptime(data["date"], "%Y-%m-%d"),
            "shipper_organization": ObjectId(data["shipper_organization"]),
            "type": "torg12"
        }
        result = self.repository.insert(document)

        details = {
            "_id": result.inserted_id,
            "consignee_organization": ObjectId(data["consignee_organization"]),
            "supplier_organization": ObjectId(data["supplier_organization"]),
            "payer_organization": ObjectId(data["payer_organization"]),
            "transport_invoice": self._normalize_transport_invoice(data["transport_invoice"]),
            "operation_type": data["operation_type"].strip(),
            "items": self._normalize_items(data["items"])
        }
        self.full_repository.insert(details)
        return {"_id": result.inserted_id}

    def update(self, data):
        self._validate_payload(data, with_id=True)
        id = ObjectId(data["_id"])

        document = {
            "number": data["number"].strip(),
            "date": datetime.strptime(data["date"], "%Y-%m-%d"),
            "shipper_organization": ObjectId(data["shipper_organization"]),
            "type": "torg12"
        }
        self.repository.replace(id, document)

        details = {
            "consignee_organization": ObjectId(data["consignee_organization"]),
            "supplier_organization": ObjectId(data["supplier_organization"]),
            "payer_organization": ObjectId(data["payer_organization"]),
            "transport_invoice": self._normalize_transport_invoice(data["transport_invoice"]),
            "operation_type": data["operation_type"].strip(),
            "items": self._normalize_items(data["items"])
        }
        result = self.full_repository.replace(id, details)
        self.error_handler.validate_document(result.matched_count)
        return {"success": True}

    def delete(self, id):
        self.error_handler.validate_object_id(id)
        oid = ObjectId(id)
        self.repository.delete(oid)
        self.full_repository.delete(oid)
        return {"success": True}
