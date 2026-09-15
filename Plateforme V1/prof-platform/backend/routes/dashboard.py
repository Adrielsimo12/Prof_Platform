from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from models import Classe, Eleve, Cours, Seance, Travail, Activite, ActiviteSuivi, EvaluationActivite
from workspace import current_teacher_id

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@bp.get("")
def get_dashboard():
    today = datetime.utcnow().date()
    in_7_days = today + timedelta(days=7)

    classes = Classe.query.filter_by(owner_id=current_teacher_id()).all()
    classes_summary = []
    for c in classes:
        classes_summary.append({
            "id": c.id,
            "nom": c.nom,
            "nb_eleves": len(c.eleves),
            "nb_cours": len(c.cours),
            "cours_termines": len([x for x in c.cours if x.statut == "termine"]),
            "cours_en_cours": len([x for x in c.cours if x.statut == "en_cours"]),
            "cours_a_faire": len([x for x in c.cours if x.statut == "a_faire"]),
        })

    total_eleves = Eleve.query.join(Classe).filter(Classe.owner_id == current_teacher_id(), Eleve.actif == True).count()

    seances_a_venir = (
        Seance.query.join(Classe).filter(Classe.owner_id == current_teacher_id(), Seance.date >= today, Seance.date <= in_7_days)
        .order_by(Seance.date, Seance.heure_debut)
        .limit(10)
        .all()
    )

    dernieres_seances = (
        Seance.query.join(Classe).filter(Classe.owner_id == current_teacher_id(), Seance.date < today)
        .order_by(Seance.date.desc())
        .limit(5)
        .all()
    )

    travaux_a_traiter = (
        Travail.query.join(Eleve).join(Classe).filter(Classe.owner_id == current_teacher_id(), Travail.statut != "rendu")
        .order_by(Travail.date_rendu)
        .limit(10)
        .all()
    )

    activites_a_rendre = []
    for activite in Activite.query.join(Classe).filter(Classe.owner_id == current_teacher_id(), Activite.rendu_aux_eleves == False).all():
        eleves = [eleve for eleve in activite.classe.eleves if eleve.actif]
        suivis = {suivi.eleve_id: suivi for suivi in ActiviteSuivi.query.filter_by(activite_id=activite.id).all()}
        evaluations = {evaluation.eleve_id for evaluation in EvaluationActivite.query.filter_by(activite_id=activite.id).all() if evaluation.note is not None}
        tous_termines = bool(eleves) and all(suivis.get(eleve.id) and suivis[eleve.id].statut == "terminee" for eleve in eleves)
        notes_completes = tous_termines and all(eleve.id in evaluations for eleve in eleves)
        if tous_termines:
            item = activite.to_dict(with_competences=False)
            item.update({"tous_termines": True, "notes_completes": notes_completes})
            activites_a_rendre.append(item)

    return jsonify({
        "classes": classes_summary,
        "total_eleves": total_eleves,
        "seances_a_venir": [s.to_dict() for s in seances_a_venir],
        "dernieres_seances": [s.to_dict() for s in dernieres_seances],
        "travaux_a_traiter": [t.to_dict() for t in travaux_a_traiter],
        "activites_a_rendre": activites_a_rendre,
    })
