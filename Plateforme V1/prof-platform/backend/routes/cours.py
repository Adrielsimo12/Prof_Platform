from flask import Blueprint, request, jsonify
from extensions import db
from models import Cours, Classe, Categorie
from workspace import current_teacher_id

bp = Blueprint("cours", __name__, url_prefix="/api/cours")


@bp.get("")
def list_cours():
    query = Cours.query.join(Classe).filter(Classe.owner_id == current_teacher_id())
    classe_id = request.args.get("classe_id")
    categorie_id = request.args.get("categorie_id")
    statut = request.args.get("statut")
    if classe_id:
        query = query.filter(Cours.classe_id == classe_id)
    if categorie_id:
        query = query.filter(Cours.categorie_id == categorie_id)
    if statut:
        query = query.filter(Cours.statut == statut)
    cours = query.order_by(Cours.categorie_id, Cours.ordre, Cours.id).all()
    return jsonify([c.to_dict() for c in cours])


@bp.post("")
def create_cours():
    data = request.get_json() or {}
    required = ["classe_id", "categorie_id", "titre"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "classe_id, categorie_id et titre sont requis"}), 400
    Classe.query.filter_by(id=data["classe_id"], owner_id=current_teacher_id()).first_or_404()
    Categorie.query.get_or_404(data["categorie_id"])
    cours = Cours(
        classe_id=data["classe_id"],
        categorie_id=data["categorie_id"],
        titre=data["titre"],
        objectifs=data.get("objectifs"),
        contenu=data.get("contenu"),
        exercices=data.get("exercices"),
        tp=data.get("tp"),
        statut=data.get("statut", "a_faire"),
        ordre=data.get("ordre", 0),
    )
    db.session.add(cours)
    db.session.commit()
    return jsonify(cours.to_dict()), 201


@bp.get("/<int:cours_id>")
def get_cours(cours_id):
    cours = Cours.query.join(Classe).filter(Cours.id == cours_id, Classe.owner_id == current_teacher_id()).first_or_404()
    return jsonify(cours.to_dict(with_ressources=True))


@bp.put("/<int:cours_id>")
def update_cours(cours_id):
    cours = Cours.query.join(Classe).filter(Cours.id == cours_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    for field in ["titre", "objectifs", "contenu", "exercices", "tp", "statut", "ordre",
                  "classe_id", "categorie_id"]:
        if field in data:
            setattr(cours, field, data[field])
    db.session.commit()
    return jsonify(cours.to_dict())


@bp.delete("/<int:cours_id>")
def delete_cours(cours_id):
    cours = Cours.query.join(Classe).filter(Cours.id == cours_id, Classe.owner_id == current_teacher_id()).first_or_404()
    db.session.delete(cours)
    db.session.commit()
    return "", 204
