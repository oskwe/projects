from flask import jsonify, request

from services.torg12 import Torg12Service


class Torg12Controller:
    def __init__(self):
        self.service = Torg12Service()

    def get_all(self):
        try:
            return jsonify(self.service.get_all())
        except ValueError as error:
            return jsonify({"success": False, "error": str(error)}), 400
        except Exception as error:
            return jsonify({"success": False, "error": str(error)}), 500

    def get_one(self, id):
        try:
            return jsonify(self.service.get_one(id))
        except ValueError as error:
            return jsonify({"success": False, "error": str(error)}), 400
        except Exception as error:
            return jsonify({"success": False, "error": str(error)}), 500

    def post(self):
        try:
            return jsonify(self.service.create(request.get_json()))
        except ValueError as error:
            return jsonify({"success": False, "error": str(error)}), 400
        except Exception as error:
            return jsonify({"success": False, "error": str(error)}), 500

    def put(self):
        try:
            return jsonify(self.service.update(request.get_json()))
        except ValueError as error:
            return jsonify({"success": False, "error": str(error)}), 400
        except Exception as error:
            return jsonify({"success": False, "error": str(error)}), 500

    def delete(self, id):
        try:
            return jsonify(self.service.delete(id))
        except ValueError as error:
            return jsonify({"success": False, "error": str(error)}), 400
        except Exception as error:
            return jsonify({"success": False, "error": str(error)}), 500
