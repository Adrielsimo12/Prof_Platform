from flask import Blueprint, jsonify
from models import Categorie

bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@bp.get("")
def list_categories():
    categories = Categorie.query.order_by(Categorie.code).all()
    return jsonify([c.to_dict() for c in categories])
