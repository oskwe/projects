from flask import Blueprint

from routes.positions import position_router
from routes.organizations import organization_router 
from routes.items import item_router 
from routes.individuals import individual_router 
from routes.proxies import proxy_router 
from routes.units import unit_router
from routes.package_types import package_type_router
from routes.basis_documents import basis_document_router
from routes.torg12 import torg12_router

router = Blueprint('/', __name__, url_prefix="/api")
router.register_blueprint(position_router)
router.register_blueprint(organization_router)
router.register_blueprint(item_router)
router.register_blueprint(individual_router)
router.register_blueprint(proxy_router)
router.register_blueprint(unit_router)
router.register_blueprint(package_type_router)
router.register_blueprint(basis_document_router)
router.register_blueprint(torg12_router)
