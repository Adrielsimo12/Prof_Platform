from datetime import datetime
from flask import Blueprint, request, jsonify
from extensions import db
from models import Seance, Presence, Eleve, GroupeEleve, Classe
from workspace import current_teacher_id

bp = Blueprint("seances", __name__, url_prefix="/api/seances")


def supports_groups(classe):
    return (classe.nom or "").replace(" ", "").upper() == "2TNE"


def normalize_groupe(classe, groupe):
    return groupe if supports_groups(classe) and groupe in {"Groupe 1", "Groupe 2"} else "Toute la classe"


def sync_presences(seance):
    """Aligne la feuille sur les élèves actifs et le groupe de la séance."""
    seance.groupe = normalize_groupe(seance.classe, seance.groupe)
    eleves_query = Eleve.query.filter_by(classe_id=seance.classe_id, actif=True)
    if seance.groupe != "Toute la classe":
        eleves_query = eleves_query.join(
            GroupeEleve, GroupeEleve.eleve_id == Eleve.id
        ).filter(GroupeEleve.groupe == seance.groupe)

    expected_ids = {eleve.id for eleve in eleves_query.all()}
    current = {presence.eleve_id: presence for presence in seance.presences}

    for eleve_id in expected_ids - current.keys():
        db.session.add(Presence(seance_id=seance.id, eleve_id=eleve_id, statut="present"))

    for eleve_id, presence in current.items():
        if eleve_id not in expected_ids:
            db.session.delete(presence)


def parse_date(value):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


@bp.get("")
def list_seances():
    query = Seance.query.join(Classe).filter(Classe.owner_id == current_teacher_id())
    classe_id = request.args.get("classe_id")
    date_debut = request.args.get("date_debut")
    date_fin = request.args.get("date_fin")
    if classe_id:
        query = query.filter(Seance.classe_id == classe_id)
    if date_debut:
        query = query.filter(Seance.date >= parse_date(date_debut))
    if date_fin:
        query = query.filter(Seance.date <= parse_date(date_fin))
    seances = query.order_by(Seance.date.desc(), Seance.heure_debut).all()
    for seance in seances:
        sync_presences(seance)
    db.session.commit()
    return jsonify([s.to_dict(with_presences=True) for s in seances])


@bp.post("")
def create_seance():
    data = request.get_json() or {}
    if not data.get("classe_id") or not data.get("date"):
        return jsonify({"error": "classe_id et date sont requis"}), 400

    seance = Seance(
        classe_id=Classe.query.filter_by(id=data["classe_id"], owner_id=current_teacher_id()).first_or_404().id,
        cours_id=data.get("cours_id"),
        groupe=normalize_groupe(Classe.query.filter_by(id=data["classe_id"], owner_id=current_teacher_id()).first_or_404(), data.get("groupe")),
        statut=data.get("statut") or "planifiee",
        date=parse_date(data["date"]),
        heure_debut=data.get("heure_debut"),
        heure_fin=data.get("heure_fin"),
        contenu_realise=data.get("contenu_realise"),
        travail_donne=data.get("travail_donne"),
        observations=data.get("observations"),
    )
    db.session.add(seance)
    db.session.flush()  # pour avoir seance.id avant de créer les présences

    # Initialiser la feuille de présence : tous présents par défaut
    eleves_query = Eleve.query.filter_by(classe_id=data["classe_id"], actif=True)
    if seance.groupe != "Toute la classe":
        from models import GroupeEleve
        eleves_query = eleves_query.join(GroupeEleve, GroupeEleve.eleve_id == Eleve.id).filter(GroupeEleve.groupe == seance.groupe)
    eleves = eleves_query.all()
    for eleve in eleves:
        db.session.add(Presence(seance_id=seance.id, eleve_id=eleve.id, statut="present"))

    db.session.commit()
    return jsonify(seance.to_dict(with_presences=True)), 201


@bp.get("/<int:seance_id>")
def get_seance(seance_id):
    seance = Seance.query.join(Classe).filter(Seance.id == seance_id, Classe.owner_id == current_teacher_id()).first_or_404()
    sync_presences(seance)
    db.session.commit()
    return jsonify(seance.to_dict(with_presences=True))


@bp.put("/<int:seance_id>")
def update_seance(seance_id):
    seance = Seance.query.join(Classe).filter(Seance.id == seance_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    for field in ["cours_id", "groupe", "statut", "heure_debut", "heure_fin", "contenu_realise",
                  "travail_donne", "observations"]:
        if field in data:
            setattr(seance, field, data[field])
    seance.groupe = normalize_groupe(seance.classe, seance.groupe)
    if "date" in data:
        seance.date = parse_date(data["date"])
    sync_presences(seance)
    db.session.commit()
    return jsonify(seance.to_dict(with_presences=True))


@bp.delete("/<int:seance_id>")
def delete_seance(seance_id):
    seance = Seance.query.join(Classe).filter(Seance.id == seance_id, Classe.owner_id == current_teacher_id()).first_or_404()
    db.session.delete(seance)
    db.session.commit()
    return "", 204


@bp.put("/<int:seance_id>/presences")
def update_presences(seance_id):
    """Met à jour en masse les présences d'une séance.
    Payload attendu : {"presences": [{"eleve_id": 1, "statut": "absent", "justifie": false}, ...]}
    """
    Seance.query.join(Classe).filter(Seance.id == seance_id, Classe.owner_id == current_teacher_id()).first_or_404()
    data = request.get_json() or {}
    for item in data.get("presences", []):
        presence = Presence.query.filter_by(
            seance_id=seance_id, eleve_id=item["eleve_id"]
        ).first()
        if presence:
            presence.statut = item.get("statut", presence.statut)
            presence.justifie = item.get("justifie", presence.justifie)
    db.session.commit()
    seance = Seance.query.join(Classe).filter(Seance.id == seance_id, Classe.owner_id == current_teacher_id()).first_or_404()
    return jsonify(seance.to_dict(with_presences=True))
