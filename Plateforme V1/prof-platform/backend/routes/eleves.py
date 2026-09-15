from datetime import datetime
from flask import Blueprint, request, jsonify
from extensions import db
from models import Eleve, Presence, Evaluation, Observation, Travail, GroupeEleve, Classe
from workspace import current_teacher_id

bp = Blueprint("eleves", __name__, url_prefix="/api/eleves")


def parse_date(value):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


@bp.post("")
def create_eleve():
    data = request.get_json() or {}
    if not data.get("nom") or not data.get("prenom") or not data.get("classe_id"):
        return jsonify({"error": "nom, prenom et classe_id sont requis"}), 400
    Classe.query.filter_by(id=data["classe_id"], owner_id=current_teacher_id()).first_or_404()
    eleve = Eleve(
        nom=data["nom"],
        prenom=data["prenom"],
        classe_id=data["classe_id"],
        email=data.get("email"),
        date_naissance=parse_date(data.get("date_naissance")),
    )
    db.session.add(eleve)
    db.session.commit()
    if data.get("groupe"):
        db.session.add(GroupeEleve(eleve_id=eleve.id, groupe=data["groupe"]))
        db.session.commit()
    return jsonify(eleve.to_dict()), 201


@bp.get("/<int:eleve_id>")
def get_eleve(eleve_id):
    eleve = Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = eleve.to_dict(full=True)
    data["presences"] = [p.to_dict() for p in eleve.presences]
    data["evaluations"] = [e.to_dict() for e in eleve.evaluations]
    data["observations"] = [o.to_dict() for o in eleve.observations]
    data["travaux"] = [t.to_dict() for t in eleve.travaux]
    return jsonify(data)


@bp.put("/<int:eleve_id>")
def update_eleve(eleve_id):
    eleve = Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    eleve.nom = data.get("nom", eleve.nom)
    eleve.prenom = data.get("prenom", eleve.prenom)
    eleve.classe_id = data.get("classe_id", eleve.classe_id)
    eleve.email = data.get("email", eleve.email)
    if "date_naissance" in data:
        eleve.date_naissance = parse_date(data.get("date_naissance"))
    eleve.actif = data.get("actif", eleve.actif)
    db.session.commit()
    if "groupe" in data:
        affectation = GroupeEleve.query.filter_by(eleve_id=eleve.id).first()
        if data["groupe"]:
            if affectation:
                affectation.groupe = data["groupe"]
            else:
                db.session.add(GroupeEleve(eleve_id=eleve.id, groupe=data["groupe"]))
        elif affectation:
            db.session.delete(affectation)
        db.session.commit()
    return jsonify(eleve.to_dict())


@bp.delete("/<int:eleve_id>")
def delete_eleve(eleve_id):
    eleve = Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    db.session.delete(eleve)
    db.session.commit()
    return "", 204


# ---- Évaluations ----

@bp.post("/<int:eleve_id>/evaluations")
def add_evaluation(eleve_id):
    Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    evaluation = Evaluation(
        eleve_id=eleve_id,
        cours_id=data.get("cours_id"),
        titre=data.get("titre"),
        note=data.get("note"),
        bareme=data.get("bareme", 20),
        commentaire=data.get("commentaire"),
        date=parse_date(data.get("date")) or datetime.utcnow().date(),
    )
    db.session.add(evaluation)
    db.session.commit()
    return jsonify(evaluation.to_dict()), 201


@bp.delete("/evaluations/<int:evaluation_id>")
def delete_evaluation(evaluation_id):
    evaluation = Evaluation.query.get_or_404(evaluation_id)
    db.session.delete(evaluation)
    db.session.commit()
    return "", 204


# ---- Observations ----

@bp.post("/<int:eleve_id>/observations")
def add_observation(eleve_id):
    Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    if not data.get("texte"):
        return jsonify({"error": "Le texte de l'observation est requis"}), 400
    observation = Observation(
        eleve_id=eleve_id,
        categorie=data.get("categorie", "autre"),
        texte=data["texte"],
        date=parse_date(data.get("date")) or datetime.utcnow().date(),
    )
    db.session.add(observation)
    db.session.commit()
    return jsonify(observation.to_dict()), 201


@bp.delete("/observations/<int:observation_id>")
def delete_observation(observation_id):
    observation = Observation.query.get_or_404(observation_id)
    db.session.delete(observation)
    db.session.commit()
    return "", 204


# ---- Travaux ----

@bp.post("/<int:eleve_id>/travaux")
def add_travail(eleve_id):
    Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    if not data.get("titre"):
        return jsonify({"error": "Le titre du travail est requis"}), 400
    travail = Travail(
        eleve_id=eleve_id,
        cours_id=data.get("cours_id"),
        titre=data["titre"],
        date_rendu=parse_date(data.get("date_rendu")),
        statut=data.get("statut", "a_rendre"),
    )
    db.session.add(travail)
    db.session.commit()
    return jsonify(travail.to_dict()), 201


@bp.put("/travaux/<int:travail_id>")
def update_travail(travail_id):
    travail = Travail.query.get_or_404(travail_id)
    data = request.get_json() or {}
    travail.statut = data.get("statut", travail.statut)
    if "date_rendu" in data:
        travail.date_rendu = parse_date(data.get("date_rendu"))
    db.session.commit()
    return jsonify(travail.to_dict())


@bp.delete("/travaux/<int:travail_id>")
def delete_travail(travail_id):
    travail = Travail.query.get_or_404(travail_id)
    db.session.delete(travail)
    db.session.commit()
    return "", 204
