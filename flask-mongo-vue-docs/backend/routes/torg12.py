from flask import Blueprint

from controllers.torg12 import Torg12Controller

torg12_router = Blueprint("torg12", __name__, url_prefix="/torg12")
controller = Torg12Controller()


@torg12_router.get("/")
def get_all():
    return controller.get_all()


@torg12_router.get("/<id>")
def get_one(id: int):
    return controller.get_one(id)


@torg12_router.post("/")
def post():
    return controller.post()


@torg12_router.put("/")
def put():
    return controller.put()


@torg12_router.delete("/<id>")
def delete(id: int):
    return controller.delete(id)
