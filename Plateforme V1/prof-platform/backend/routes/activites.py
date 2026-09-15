from datetime import datetime
from flask import Blueprint, request, jsonify

from extensions import db
from models import (
    Activite,
    ActiviteCompetence,
    Competence,
    Classe,
    Cours,
    Eleve,
    ActiviteSuivi,
    EvaluationActivite,
)
from workspace import current_teacher_id

bp = Blueprint(
    "activites",
    __name__,
    url_prefix="/api"
)


# ================================================================
# LISTE
# ================================================================

@bp.get("/activites")
def get_activites():

    classe_id = request.args.get(
        "classe_id",
        type=int
    )

    cours_id = request.args.get(
        "cours_id",
        type=int
    )

    query = Activite.query.join(Classe).filter(Classe.owner_id == current_teacher_id())

    if classe_id:
        query = query.filter(Activite.classe_id == classe_id)

    if cours_id:
        query = query.filter(Activite.cours_id == cours_id)

    activites = query.order_by(
        Activite.date_debut.desc()
    ).all()

    return jsonify([
        a.to_dict()
        for a in activites
    ])


# ================================================================
# DETAIL
# ================================================================

@bp.get("/activites/<int:activite_id>")
def get_activite(
    activite_id
):

    activite = Activite.query.join(Classe).filter(Activite.id == activite_id, Classe.owner_id == current_teacher_id()).first_or_404()

    return jsonify(
        activite.to_dict()
    )


@bp.post("/activites/<int:activite_id>/rendre")
def rendre_activite(activite_id):
    activite = Activite.query.join(Classe).filter(
        Activite.id == activite_id,
        Classe.owner_id == current_teacher_id(),
    ).first_or_404()
    eleves = Eleve.query.filter_by(classe_id=activite.classe_id, actif=True).all()
    suivis = {
        suivi.eleve_id: suivi
        for suivi in ActiviteSuivi.query.filter_by(activite_id=activite.id).all()
    }
    notes = {
        evaluation.eleve_id
        for evaluation in EvaluationActivite.query.filter_by(activite_id=activite.id).all()
        if evaluation.note is not None
    }
    if not eleves or any(not suivis.get(eleve.id) or suivis[eleve.id].statut != "terminee" for eleve in eleves):
        return jsonify({"error": "Tous les élèves doivent avoir terminé l'activité."}), 400
    if any(eleve.id not in notes for eleve in eleves):
        return jsonify({"error": "Une note doit être saisie pour chaque élève."}), 400

    activite.rendu_aux_eleves = True
    activite.rendu_at = datetime.utcnow()
    db.session.commit()
    return jsonify(activite.to_dict())


# ================================================================
# CREATION
# ================================================================

@bp.post("/activites")
def create_activite():

    data = request.get_json() or {}

    if not data.get("classe_id"):
        return jsonify({
            "error":
                "La classe est obligatoire"
        }), 400

    if not data.get("titre"):
        return jsonify({
            "error":
                "Le titre est obligatoire"
        }), 400

    Classe.query.filter_by(id=data["classe_id"], owner_id=current_teacher_id()).first_or_404()

    if data.get("cours_id"):
        Cours.query.get_or_404(
            data["cours_id"]
        )

    activite = Activite(
        classe_id=data["classe_id"],
        cours_id=data.get(
            "cours_id"
        ),
        titre=data["titre"],
        description=data.get(
            "description"
        ),
        contexte=data.get(
            "contexte"
        ),
        consignes=data.get(
            "consignes"
        ),
        production_attendue=data.get(
            "production_attendue"
        ),
        criteres_reussite=data.get(
            "criteres_reussite"
        ),
        statut=data.get(
            "statut",
            "a_faire"
        )
    )

    db.session.add(activite)
    db.session.flush()

    # ============================================================
    # COMPETENCES ASSOCIEES
    # ============================================================

    competence_ids = data.get(
        "competence_ids",
        []
    )

    for competence_id in competence_ids:

        competence = Competence.query.get(
            competence_id
        )

        if not competence:
            continue

        liaison = ActiviteCompetence(
            activite_id=activite.id,
            competence_id=competence.id
        )

        db.session.add(liaison)

    db.session.commit()

    return jsonify(
        activite.to_dict()
    ), 201


# ================================================================
# MODIFICATION
# ================================================================

@bp.put("/activites/<int:activite_id>")
def update_activite(
    activite_id
):

    activite = Activite.query.join(Classe).filter(Activite.id == activite_id, Classe.owner_id == current_teacher_id()).first_or_404()

    data = request.get_json() or {}

    for field in [
        "titre",
        "description",
        "contexte",
        "consignes",
        "production_attendue",
        "criteres_reussite",
        "statut",
    ]:

        if field in data:
            setattr(
                activite,
                field,
                data[field]
            )

    if "classe_id" in data:
        Classe.query.get_or_404(
            data["classe_id"]
        )
        activite.classe_id = data[
            "classe_id"
        ]

    if "cours_id" in data:
        if data["cours_id"]:
            Cours.query.get_or_404(
                data["cours_id"]
            )

        activite.cours_id = data[
            "cours_id"
        ]

    # Remplacement des compétences
    if "competence_ids" in data:

        ActiviteCompetence.query.filter_by(
            activite_id=activite.id
        ).delete()

        for competence_id in data[
            "competence_ids"
        ]:

            competence = Competence.query.get(
                competence_id
            )

            if competence:

                db.session.add(
                    ActiviteCompetence(
                        activite_id=activite.id,
                        competence_id=competence.id
                    )
                )

    db.session.commit()

    return jsonify(
        activite.to_dict()
    )


# ================================================================
# SUPPRESSION
# ================================================================

@bp.delete("/activites/<int:activite_id>")
def delete_activite(
    activite_id
):

    activite = Activite.query.join(Classe).filter(Activite.id == activite_id, Classe.owner_id == current_teacher_id()).first_or_404()

    db.session.delete(activite)
    db.session.commit()

    return "", 204
