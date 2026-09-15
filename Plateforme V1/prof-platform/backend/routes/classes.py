from flask import Blueprint, request, jsonify
from extensions import db
from models import Classe, Eleve, Activite, ActiviteSuivi, GroupeEleve
from workspace import current_teacher, current_teacher_id
import csv
import io

bp = Blueprint("classes", __name__, url_prefix="/api/classes")


def _classe_order_key(nom):
    name = (nom or "").strip().upper()
    rank = {
        "2TNE": 0,
        "1CIEL": 1,
        "T CIEL": 2,
    }
    return (rank.get(name, 99), name)


@bp.get("")
def list_classes():
    classes = Classe.query.filter_by(owner_id=current_teacher_id()).all()
    classes.sort(key=lambda c: _classe_order_key(c.nom))
    return jsonify([c.to_dict(with_counts=True) for c in classes])


@bp.post("")
def create_classe():
    data = request.get_json() or {}
    if not data.get("nom"):
        return jsonify({"error": "Le nom de la classe est requis"}), 400
    owner_id = current_teacher_id()
    if Classe.query.filter_by(owner_id=owner_id, nom=data["nom"].strip()).first():
        return jsonify({"error": "Cette classe existe déjà dans votre espace."}), 409
    classe = Classe(
        nom=data["nom"].strip(),
        annee_scolaire=data.get("annee_scolaire", "2026-2027"),
        filiere=(data.get("filiere") or "").strip() or current_teacher().filiere,
        owner_id=owner_id,
    )
    db.session.add(classe)
    db.session.commit()
    return jsonify(classe.to_dict()), 201


@bp.get("/<int:classe_id>")
def get_classe(classe_id):
    classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    return jsonify(classe.to_dict(with_counts=True))


@bp.put("/<int:classe_id>")
def update_classe(classe_id):
    classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    classe.nom = data.get("nom", classe.nom)
    classe.annee_scolaire = data.get("annee_scolaire", classe.annee_scolaire)
    if "filiere" in data:
        classe.filiere = (data.get("filiere") or "").strip() or None
    db.session.commit()
    return jsonify(classe.to_dict())


@bp.delete("/<int:classe_id>")
def delete_classe(classe_id):
    classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    db.session.delete(classe)
    db.session.commit()
    return "", 204


@bp.get("/<int:classe_id>/eleves")
def list_eleves(classe_id):
    Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    eleves = Eleve.query.filter_by(classe_id=classe_id).order_by(Eleve.nom).all()
    return jsonify([e.to_dict(full=True) for e in eleves])


@bp.get("/<int:classe_id>/activites-suivi")
def get_activites_suivi(classe_id):
    classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    eleves = Eleve.query.filter_by(classe_id=classe_id).order_by(Eleve.nom, Eleve.prenom).all()
    activites = Activite.query.filter_by(classe_id=classe_id).order_by(Activite.date_debut.desc(), Activite.id.desc()).all()
    suivis = ActiviteSuivi.query.join(Eleve).filter(Eleve.classe_id == classe_id).all()
    return jsonify({
        "classe": classe.to_dict(),
        "eleves": [e.to_dict() for e in eleves],
        "activites": [a.to_dict(with_competences=False) for a in activites],
        "suivis": [s.to_dict() for s in suivis],
    })


@bp.put("/<int:classe_id>/activites-suivi")
def update_activites_suivi(classe_id):
    Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    eleves = {e.id: e for e in Eleve.query.filter_by(classe_id=classe_id).all()}
    activites = {a.id: a for a in Activite.query.filter_by(classe_id=classe_id).all()}

    for eleve_id, groupe in (data.get("groupes") or {}).items():
        eleve_id = int(eleve_id)
        if eleve_id not in eleves:
            continue
        affectation = GroupeEleve.query.filter_by(eleve_id=eleve_id).first()
        if groupe:
            if affectation:
                affectation.groupe = groupe
            else:
                db.session.add(GroupeEleve(eleve_id=eleve_id, groupe=groupe))
        elif affectation:
            db.session.delete(affectation)

    for item in data.get("suivis", []):
        activite_id = int(item.get("activite_id", 0))
        eleve_id = int(item.get("eleve_id", 0))
        if activite_id not in activites or eleve_id not in eleves:
            continue
        suivi = ActiviteSuivi.query.filter_by(activite_id=activite_id, eleve_id=eleve_id).first()
        statut = item.get("statut")
        if statut not in {"a_commencer", "commencee", "terminee"}:
            statut = "terminee" if item.get("fait") else "a_commencer"
        if suivi:
            suivi.statut = statut
        else:
            db.session.add(ActiviteSuivi(activite_id=activite_id, eleve_id=eleve_id, statut=statut))

    db.session.commit()
    return get_activites_suivi(classe_id)


@bp.get("/<int:classe_id>/eleves/export")
def export_eleves(classe_id):
    classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    eleves = Eleve.query.filter_by(classe_id=classe_id).order_by(Eleve.nom).all()
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["nom", "prenom", "email", "date_naissance"])
    for e in eleves:
        writer.writerow([
            e.nom, e.prenom, e.email or "",
            e.date_naissance.isoformat() if e.date_naissance else "",
        ])
    return jsonify({"filename": f"eleves_{classe.nom}.csv", "content": output.getvalue()})


@bp.post("/<int:classe_id>/eleves/import")
def import_eleves(classe_id):
    Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    csv_content = data.get("content", "")
    reader = csv.DictReader(io.StringIO(csv_content), delimiter=";")
    created = 0
    for row in reader:
        nom = (row.get("nom") or "").strip()
        prenom = (row.get("prenom") or "").strip()
        if not nom or not prenom:
            continue
        eleve = Eleve(
            nom=nom,
            prenom=prenom,
            classe_id=classe_id,
            email=(row.get("email") or "").strip() or None,
        )
        db.session.add(eleve)
        created += 1
    db.session.commit()
    return jsonify({"created": created})
