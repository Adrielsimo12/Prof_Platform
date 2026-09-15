from flask import Blueprint, request, jsonify
from extensions import db
from models import Categorie, Classe, Cours
from workspace import current_teacher, current_teacher_id

bp = Blueprint("categories", __name__, url_prefix="/api/categories")


def _resolve_filiere():
    filiere = request.args.get("filiere")
    if filiere:
        return filiere
    classe_id = request.args.get("classe_id", type=int)
    if classe_id:
        classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first()
        if classe and classe.filiere:
            return classe.filiere
    return None


@bp.get("")
def list_categories():
    teacher_id = current_teacher_id()
    filiere = _resolve_filiere()

    query = Categorie.query.filter(
        db.or_(Categorie.owner_id.is_(None), Categorie.owner_id == teacher_id)
    )
    if filiere:
        query = query.filter(db.or_(Categorie.filiere.is_(None), Categorie.filiere == filiere))

    categories = query.order_by(Categorie.code).all()
    return jsonify([
        {**c.to_dict(), "removable": c.owner_id == teacher_id}
        for c in categories
    ])


@bp.post("")
def create_categorie():
    data = request.get_json() or {}
    code = (data.get("code") or "").strip()
    nom = (data.get("nom") or "").strip()

    if not code:
        return jsonify({"error": "Le code est obligatoire"}), 400
    if not nom:
        return jsonify({"error": "Le nom est obligatoire"}), 400

    teacher_id = current_teacher_id()
    filiere = (data.get("filiere") or "").strip() or current_teacher().filiere

    if Categorie.query.filter_by(owner_id=teacher_id, filiere=filiere, code=code).first():
        return jsonify({"error": "Vous avez déjà une catégorie avec ce code pour cette filière."}), 409

    categorie = Categorie(code=code, nom=nom, filiere=filiere, owner_id=teacher_id)
    db.session.add(categorie)
    db.session.commit()
    return jsonify({**categorie.to_dict(), "removable": True}), 201


@bp.delete("/<int:categorie_id>")
def delete_categorie(categorie_id):
    teacher_id = current_teacher_id()
    categorie = Categorie.query.filter_by(id=categorie_id, owner_id=teacher_id).first_or_404()

    if Cours.query.filter_by(categorie_id=categorie.id).first():
        return jsonify({"error": "Des cours utilisent encore cette catégorie."}), 409

    db.session.delete(categorie)
    db.session.commit()
    return "", 204
