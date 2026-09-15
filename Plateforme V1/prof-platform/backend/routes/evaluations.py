from flask import Blueprint, request, jsonify

from extensions import db
from models import (
    EvaluationCompetence,
    Eleve,
    Competence,
    Activite,
    EvaluationActivite,
    Classe,
    Appreciation,
)
from workspace import current_teacher, current_teacher_id


def _resolve_filiere():
    """Filière explicite > filière de la classe > filière de l'enseignant (même logique que /api/competences)."""
    filiere = request.args.get("filiere") or (request.get_json(silent=True) or {}).get("filiere")
    if filiere:
        return filiere
    classe_id = request.args.get("classe_id", type=int) or (request.get_json(silent=True) or {}).get("classe_id")
    if classe_id:
        classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first()
        if classe and classe.filiere:
            return classe.filiere
    return current_teacher().filiere

bp = Blueprint(
    "evaluations_competences",
    __name__,
    url_prefix="/api"
)

DEFAULT_APPRECIATIONS = [
    "Très bon travail",
    "Travail satisfaisant",
    "Ensemble correct",
    "Des progrès sont attendus",
    "Doit encore s'investir",
]


@bp.get("/appreciations")
def get_appreciations():
    filiere = _resolve_filiere()
    items = Appreciation.query.filter_by(filiere=filiere, actif=True).order_by(Appreciation.id).all()
    if not items:
        items = [Appreciation(libelle=label, filiere=filiere) for label in DEFAULT_APPRECIATIONS]
        db.session.add_all(items)
        db.session.commit()
    return jsonify([{"id": item.id, "libelle": item.libelle, "filiere": item.filiere} for item in items])


@bp.post("/appreciations")
def create_appreciation():
    data = request.get_json() or {}
    libelle = (data.get("libelle") or "").strip()
    filiere = _resolve_filiere()
    if not libelle:
        return jsonify({"error": "L'appréciation est obligatoire."}), 400
    item = Appreciation(libelle=libelle, filiere=filiere)
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id, "libelle": item.libelle, "filiere": item.filiere}), 201


def validate_note(value):
    try:
        note = float(value)
    except (TypeError, ValueError):
        return None
    return note if 0 <= note <= 20 else None


@bp.get("/evaluations-activites")
def get_evaluation_activite():
    query = EvaluationActivite.query.join(Eleve).join(Classe).filter(Classe.owner_id == current_teacher_id())
    eleve_id = request.args.get("eleve_id", type=int)
    activite_id = request.args.get("activite_id", type=int)
    if eleve_id:
        query = query.filter(EvaluationActivite.eleve_id == eleve_id)
    if activite_id:
        query = query.filter(EvaluationActivite.activite_id == activite_id)
    return jsonify([item.to_dict() for item in query.order_by(EvaluationActivite.date.desc()).all()])


@bp.post("/evaluations-activites")
def save_evaluation_activite():
    data = request.get_json() or {}
    eleve_id = data.get("eleve_id")
    activite_id = data.get("activite_id")
    note = validate_note(data.get("note"))
    if not eleve_id or not activite_id or note is None:
        return jsonify({"error": "L'élève, l'activité et une note entre 0 et 20 sont obligatoires."}), 400
    Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()
    Activite.query.join(Classe).filter(Activite.id == activite_id, Classe.owner_id == current_teacher_id()).first_or_404()
    evaluation = EvaluationActivite.query.join(Eleve).join(Classe).filter(
        EvaluationActivite.eleve_id == eleve_id,
        EvaluationActivite.activite_id == activite_id,
        Classe.owner_id == current_teacher_id(),
    ).first()
    is_new = evaluation is None
    if is_new:
        evaluation = EvaluationActivite(eleve_id=eleve_id, activite_id=activite_id)
        db.session.add(evaluation)
    evaluation.note = note
    evaluation.bareme = 20
    db.session.commit()
    return jsonify(evaluation.to_dict()), 201 if is_new else 200

# ================================================================
# EVALUATIONS
# ================================================================

@bp.get("/evaluations-competences")
def get_evaluations():

    eleve_id = request.args.get(
        "eleve_id",
        type=int
    )

    competence_id = request.args.get(
        "competence_id",
        type=int
    )

    activite_id = request.args.get(
        "activite_id",
        type=int
    )

    query = EvaluationCompetence.query.join(Eleve).join(Classe).filter(Classe.owner_id == current_teacher_id())

    if eleve_id:
        query = query.filter(EvaluationCompetence.eleve_id == eleve_id)

    if competence_id:
        query = query.filter(EvaluationCompetence.competence_id == competence_id)

    if activite_id:
        query = query.filter(EvaluationCompetence.activite_id == activite_id)

    evaluations = query.order_by(
        EvaluationCompetence.date.desc()
    ).all()

    return jsonify([
        e.to_dict()
        for e in evaluations
    ])


# ================================================================
# CREATION
# ================================================================

@bp.post("/evaluations-competences")
def create_evaluation():

    data = request.get_json() or {}

    eleve_id = data.get(
        "eleve_id"
    )

    competence_id = data.get(
        "competence_id"
    )

    niveau = data.get(
        "niveau"
    )

    if not eleve_id:
        return jsonify({
            "error":
                "L'élève est obligatoire"
        }), 400

    if not competence_id:
        return jsonify({
            "error":
                "La compétence est obligatoire"
        }), 400

    if niveau is None:
        return jsonify({
            "error":
                "Le niveau est obligatoire"
        }), 400

    if niveau not in [0, 1, 2, 3]:
        return jsonify({
            "error":
                "Le niveau doit être compris entre 0 et 3"
        }), 400

    eleve = Eleve.query.join(Classe).filter(Eleve.id == eleve_id, Classe.owner_id == current_teacher_id()).first_or_404()

    classe = Classe.query.get(eleve.classe_id)
    filiere_classe = (classe.filiere if classe else None) or current_teacher().filiere
    competence = Competence.query.filter_by(id=competence_id, filiere=filiere_classe).first()
    if not competence:
        return jsonify({"error": "Cette compétence n'appartient pas à la filière de la classe de l'élève."}), 400

    appreciation_id = data.get("appreciation_id")
    appreciation = None
    if appreciation_id:
        appreciation = Appreciation.query.filter_by(id=appreciation_id, actif=True).first()
        if not appreciation:
            return jsonify({"error": "Appréciation invalide."}), 400

    if data.get("activite_id"):
        Activite.query.join(Classe).filter(Activite.id == data["activite_id"], Classe.owner_id == current_teacher_id()).first_or_404()

    evaluation = EvaluationCompetence(
        eleve_id=eleve_id,
        competence_id=competence_id,
        activite_id=data.get(
            "activite_id"
        ),
        niveau=niveau,
        commentaire=data.get(
            "commentaire"
        ),
        appreciation_id=appreciation.id if appreciation else None,
    )

    db.session.add(evaluation)
    db.session.commit()

    return jsonify(
        evaluation.to_dict()
    ), 201


# ================================================================
# MODIFICATION
# ================================================================

@bp.put(
    "/evaluations-competences/<int:evaluation_id>"
)
def update_evaluation(
    evaluation_id
):

    evaluation = EvaluationCompetence.query.join(Eleve).join(Classe).filter(EvaluationCompetence.id == evaluation_id, Classe.owner_id == current_teacher_id()).first_or_404()

    data = request.get_json() or {}

    if "niveau" in data:

        if data["niveau"] not in [
            0, 1, 2, 3
        ]:
            return jsonify({
                "error":
                    "Niveau invalide"
            }), 400

        evaluation.niveau = data[
            "niveau"
        ]

    if "commentaire" in data:
        evaluation.commentaire = data[
            "commentaire"
        ]

    if "appreciation_id" in data:
        appreciation = Appreciation.query.filter_by(id=data["appreciation_id"], actif=True).first() if data["appreciation_id"] else None
        if data["appreciation_id"] and not appreciation:
            return jsonify({"error": "Appréciation invalide."}), 400
        evaluation.appreciation_id = appreciation.id if appreciation else None

    db.session.commit()

    return jsonify(
        evaluation.to_dict()
    )


# ================================================================
# SUPPRESSION
# ================================================================

@bp.delete(
    "/evaluations-competences/<int:evaluation_id>"
)
def delete_evaluation(
    evaluation_id
):

    evaluation = EvaluationCompetence.query.join(Eleve).join(Classe).filter(EvaluationCompetence.id == evaluation_id, Classe.owner_id == current_teacher_id()).first_or_404()

    db.session.delete(evaluation)
    db.session.commit()

    return "", 204

