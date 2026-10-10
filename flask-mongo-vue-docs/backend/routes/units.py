from flask import Blueprint

from controllers.units import UnitController

unit_router = Blueprint("units", __name__, url_prefix="/units")
controller = UnitController()


@unit_router.get("/")
def get_all():
    return controller.get_all()


@unit_router.get("/<id>")
def get_one(id: int):
    return controller.get_one(id)


@unit_router.post("/")
def post():
    return controller.post()


@unit_router.put("/")
def put():
    return controller.put()


@unit_router.delete("/<id>")
def delete(id: int):
    return controller.delete(id)
