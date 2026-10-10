from flask import Blueprint

from controllers.basis_documents import BasisDocumentController

basis_document_router = Blueprint("basis_documents", __name__, url_prefix="/basis-documents")
controller = BasisDocumentController()


@basis_document_router.get("/")
def get_all():
    return controller.get_all()


@basis_document_router.get("/<id>")
def get_one(id: int):
    return controller.get_one(id)


@basis_document_router.post("/")
def post():
    return controller.post()


@basis_document_router.put("/")
def put():
    return controller.put()


@basis_document_router.delete("/<id>")
def delete(id: int):
    return controller.delete(id)
