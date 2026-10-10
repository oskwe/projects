from utils.database import get_collection


class Torg12Repository:
    def __init__(self):
        self.collection = get_collection("documents")

    def find_all(self):
        return list(self.collection.aggregate([
            {"$match": {"type": {"$in": ["torg12", "hiring_order"]}}},
            {"$lookup": {
                "from": "organizations",
                "localField": "shipper_organization",
                "foreignField": "_id",
                "as": "shipper_organization"
            }},
            {"$unwind": {"path": "$shipper_organization", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "organizations",
                "localField": "organization",
                "foreignField": "_id",
                "as": "legacy_organization"
            }},
            {"$unwind": {"path": "$legacy_organization", "preserveNullAndEmptyArrays": True}},
            {"$set": {
                "shipper_organization": {"$ifNull": ["$shipper_organization", "$legacy_organization"]},
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}}
            }},
            {"$unset": [
                "legacy_organization"
            ]}
        ]))

    def _find_base_document(self, id):
        documents = list(self.collection.aggregate([
            {"$match": {"_id": id}},
            {"$lookup": {
                "from": "organizations",
                "localField": "shipper_organization",
                "foreignField": "_id",
                "as": "shipper_organization"
            }},
            {"$unwind": {"path": "$shipper_organization", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "organizations",
                "localField": "organization",
                "foreignField": "_id",
                "as": "legacy_organization"
            }},
            {"$unwind": {"path": "$legacy_organization", "preserveNullAndEmptyArrays": True}},
            {"$set": {
                "shipper_organization": {"$ifNull": ["$shipper_organization", "$legacy_organization"]},
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}}
            }},
            {"$unset": ["legacy_organization"]}
        ]))
        return documents[0] if documents else None

    def find_one(self, id):
        base_document = self._find_base_document(id)
        if not base_document:
            return None

        if base_document.get("type") != "torg12":
            shipper = base_document.get("shipper_organization")
            return {
                "_id": base_document["_id"],
                "number": base_document.get("number", ""),
                "date": base_document.get("date", ""),
                "type": base_document.get("type"),
                "shipper_organization": shipper,
                "consignee_organization": shipper,
                "supplier_organization": shipper,
                "payer_organization": shipper,
                "transport_invoice": {
                    "number": "",
                    "date": ""
                },
                "operation_type": "",
                "items": []
            }

        documents = list(self.collection.aggregate([
            {"$match": {"type": "torg12", "_id": id}},
            {"$lookup": {
                "from": "full_documents",
                "localField": "_id",
                "foreignField": "_id",
                "as": "details"
            }},
            {"$unwind": "$details"},
            {"$unwind": "$details.items"},
            {"$lookup": {
                "from": "items",
                "localField": "details.items.item",
                "foreignField": "_id",
                "as": "details.items.item"
            }},
            {"$unwind": "$details.items.item"},
            {"$lookup": {
                "from": "units",
                "localField": "details.items.unit",
                "foreignField": "_id",
                "as": "details.items.unit"
            }},
            {"$unwind": "$details.items.unit"},
            {"$lookup": {
                "from": "package_types",
                "localField": "details.items.package_type",
                "foreignField": "_id",
                "as": "details.items.package_type"
            }},
            {"$unwind": "$details.items.package_type"},
            {"$group": {
                "_id": "$_id",
                "number": {"$first": "$number"},
                "date": {"$first": "$date"},
                "shipper_organization": {"$first": "$shipper_organization"},
                "consignee_organization": {"$first": "$details.consignee_organization"},
                "supplier_organization": {"$first": "$details.supplier_organization"},
                "payer_organization": {"$first": "$details.payer_organization"},
                "transport_invoice": {"$first": "$details.transport_invoice"},
                "operation_type": {"$first": "$details.operation_type"},
                "items": {"$push": "$details.items"}
            }},
            {"$lookup": {
                "from": "organizations",
                "localField": "consignee_organization",
                "foreignField": "_id",
                "as": "consignee_organization"
            }},
            {"$unwind": "$consignee_organization"},
            {"$lookup": {
                "from": "organizations",
                "localField": "supplier_organization",
                "foreignField": "_id",
                "as": "supplier_organization"
            }},
            {"$unwind": "$supplier_organization"},
            {"$lookup": {
                "from": "organizations",
                "localField": "payer_organization",
                "foreignField": "_id",
                "as": "payer_organization"
            }},
            {"$unwind": "$payer_organization"},
            {"$set": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
                "transport_invoice.date": {
                    "$cond": [
                        {"$ifNull": ["$transport_invoice.date", False]},
                        {"$dateToString": {"format": "%Y-%m-%d", "date": "$transport_invoice.date"}},
                        ""
                    ]
                }
            }}
        ]))
        return documents[0] if documents else None

    def insert(self, data):
        return self.collection.insert_one(data)

    def replace(self, id, data):
        return self.collection.replace_one({"_id": id}, data)

    def delete(self, id):
        return self.collection.delete_one({"_id": id})
