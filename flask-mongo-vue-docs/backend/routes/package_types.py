from flask import Blueprint

from controllers.package_types import PackageTypeController

package_type_router = Blueprint("package_types", __name__, url_prefix="/package-types")
controller = PackageTypeController()


@package_type_router.get("/")
def get_all():
    return controller.get_all()


@package_type_router.get("/<id>")
def get_one(id: int):
    return controller.get_one(id)


@package_type_router.post("/")
def post():
    return controller.post()


@package_type_router.put("/")
def put():
    return controller.put()


@package_type_router.delete("/<id>")
def delete(id: int):
    return controller.delete(id)
