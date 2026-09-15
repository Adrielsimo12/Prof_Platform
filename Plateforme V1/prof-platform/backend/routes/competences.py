import csv
import io

from flask import Blueprint, request, jsonify

from extensions import db
from models import (
    Classe,
    DomaineCompetence,
    Competence,
    SavoirFaire,
    User,
)
from workspace import current_teacher, current_teacher_id

FILIERES_PAR_DEFAUT = ["CIEL", "MELEC"]

bp = Blueprint(
    "competences",
    __name__,
    url_prefix="/api"
)


def _resolve_filiere():
    """Résout la filière à appliquer : filière explicite > filière de la classe > filière de l'enseignant."""
    filiere = request.args.get("filiere")
    if filiere:
        return filiere

    classe_id = request.args.get("classe_id", type=int)
    if classe_id:
        classe = Classe.query.filter_by(id=classe_id, owner_id=current_teacher_id()).first()
        if classe and classe.filiere:
            return classe.filiere

    return current_teacher().filiere


@bp.get("/filieres")
def get_filieres():
    """Liste des filières connues (valeurs par défaut + toutes celles déjà utilisées)."""
    connues = set(FILIERES_PAR_DEFAUT)
    connues.update(v for (v,) in db.session.query(Classe.filiere).distinct() if v)
    connues.update(v for (v,) in db.session.query(User.filiere).distinct() if v)
    connues.update(v for (v,) in db.session.query(DomaineCompetence.filiere).distinct() if v)
    return jsonify(sorted(connues))


# ================================================================
# DOMAINES
# ================================================================

@bp.get("/domaines-competences")
def get_domaines():
    filiere = _resolve_filiere()
    domaines = DomaineCompetence.query.order_by(
        DomaineCompetence.ordre
    ).filter_by(filiere=filiere).all()

    return jsonify([
        d.to_dict(with_competences=True)
        for d in domaines
    ])


@bp.post("/domaines-competences")
def create_domaine():

    data = request.get_json() or {}

    if not data.get("code"):
        return jsonify({
            "error": "Le code est obligatoire"
        }), 400

    if not data.get("nom"):
        return jsonify({
            "error": "Le nom est obligatoire"
        }), 400

    domaine = DomaineCompetence(
        code=data["code"],
        filiere=data.get("filiere") or current_teacher().filiere,
        nom=data["nom"],
        description=data.get(
            "description"
        ),
        ordre=data.get(
            "ordre",
            0
        )
    )

    db.session.add(domaine)
    db.session.commit()

    return jsonify(
        domaine.to_dict()
    ), 201


@bp.delete("/domaines-competences/<int:domaine_id>")
def delete_domaine(domaine_id):
    domaine = DomaineCompetence.query.get_or_404(domaine_id)
    db.session.delete(domaine)
    db.session.commit()
    return "", 204


# ================================================================
# COMPETENCES
# ================================================================

@bp.get("/competences")
def get_competences():

    domaine_id = request.args.get(
        "domaine_id",
        type=int
    )

    query = Competence.query.filter_by(filiere=_resolve_filiere())

    if domaine_id:
        query = query.filter_by(
            domaine_id=domaine_id
        )

    competences = query.order_by(
        Competence.ordre
    ).all()

    return jsonify([
        c.to_dict(
            with_savoir_faires=True
        )
        for c in competences
    ])


@bp.get("/competences/<int:competence_id>")
def get_competence(
    competence_id
):

    competence = Competence.query.get_or_404(
        competence_id
    )

    return jsonify(
        competence.to_dict(
            with_savoir_faires=True
        )
    )


@bp.post("/competences")
def create_competence():

    data = request.get_json() or {}

    if not data.get("domaine_id"):
        return jsonify({
            "error": "Le domaine est obligatoire"
        }), 400

    if not data.get("code"):
        return jsonify({
            "error": "Le code est obligatoire"
        }), 400

    if not data.get("nom"):
        return jsonify({
            "error": "Le nom est obligatoire"
        }), 400

    competence = Competence(
        domaine_id=data["domaine_id"],
        code=data["code"],
        filiere=data.get("filiere") or current_teacher().filiere,
        nom=data["nom"],
        description=data.get(
            "description"
        ),
        ordre=data.get(
            "ordre",
            0
        )
    )

    db.session.add(competence)
    db.session.commit()

    return jsonify(
        competence.to_dict()
    ), 201


@bp.post("/competences/import")
def import_competences():
    body = request.get_json() or {}
    content = body.get("content", "")
    if not content.strip():
        return jsonify({"error": "Le fichier CSV est vide."}), 400
    try:
        dialect = csv.Sniffer().sniff(content[:2048], delimiters=";,\t")
    except csv.Error:
        dialect = csv.excel
        dialect.delimiter = ";"
    reader = csv.DictReader(io.StringIO(content.lstrip("\ufeff")), dialect=dialect)
    filiere = (body.get("filiere") or "").strip() or current_teacher().filiere
    created = 0
    domaines = {}
    for line_number, raw_row in enumerate(reader, start=2):
        row = {(key or "").strip().lower(): (value or "").strip() for key, value in raw_row.items()}
        code = row.get("code") or row.get("code_competence")
        nom = row.get("nom") or row.get("competence") or row.get("intitule")
        domaine_code = row.get("domaine_code") or row.get("domaine") or "GENERAL"
        domaine_nom = row.get("domaine_nom") or domaine_code
        if not code or not nom:
            continue
        domaine = domaines.get(domaine_code)
        if domaine is None:
            domaine = DomaineCompetence.query.filter_by(code=domaine_code, filiere=filiere).first()
            if domaine is None:
                domaine = DomaineCompetence(code=domaine_code, nom=domaine_nom, filiere=filiere)
                db.session.add(domaine)
                db.session.flush()
            domaines[domaine_code] = domaine
        if Competence.query.filter_by(code=code, filiere=filiere).first():
            continue
        db.session.add(Competence(
            domaine_id=domaine.id,
            code=code,
            nom=nom,
            description=row.get("description"),
            ordre=int(row.get("ordre") or created + 1),
            filiere=filiere,
        ))
        created += 1
    if not created:
        db.session.rollback()
        return jsonify({"error": "Aucune compétence valide à importer."}), 400
    db.session.commit()
    return jsonify({"created": created, "filiere": filiere, "message": f"{created} compétence(s) importée(s)."})


@bp.get("/competences/export")
def export_competences():
    """Export CSV du référentiel de compétences.

    Sans paramètre : exporte toutes les filières (référentiel global).
    Avec ?filiere=MELEC : n'exporte que cette filière.
    """
    filiere = request.args.get("filiere")
    query = Competence.query.join(DomaineCompetence)
    if filiere:
        query = query.filter(Competence.filiere == filiere)
    competences = query.order_by(
        Competence.filiere, DomaineCompetence.ordre, Competence.ordre
    ).all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow([
        "filiere", "domaine_code", "domaine_nom", "code", "nom", "description", "ordre", "savoir_faires",
    ])
    for c in competences:
        savoir_faires = " | ".join(
            (f"{sf.code} - {sf.description}" if sf.code else sf.description)
            for sf in c.savoir_faires
        )
        writer.writerow([
            c.filiere,
            c.domaine.code if c.domaine else "",
            c.domaine.nom if c.domaine else "",
            c.code,
            c.nom,
            c.description or "",
            c.ordre,
            savoir_faires,
        ])

    filename = f"competences_{filiere}.csv" if filiere else "competences.csv"
    return jsonify({"filename": filename, "content": output.getvalue()})


@bp.put("/competences/<int:competence_id>")
def update_competence(
    competence_id
):

    competence = Competence.query.get_or_404(
        competence_id
    )

    data = request.get_json() or {}

    competence.code = data.get(
        "code",
        competence.code
    )

    competence.nom = data.get(
        "nom",
        competence.nom
    )

    competence.description = data.get(
        "description",
        competence.description
    )

    competence.ordre = data.get(
        "ordre",
        competence.ordre
    )

    if data.get("domaine_id"):
        competence.domaine_id = data[
            "domaine_id"
        ]

    db.session.commit()

    return jsonify(
        competence.to_dict(
            with_savoir_faires=True
        )
    )


@bp.delete("/competences/<int:competence_id>")
def delete_competence(
    competence_id
):

    competence = Competence.query.get_or_404(
        competence_id
    )

    db.session.delete(competence)
    db.session.commit()

    return "", 204


# ================================================================
# SAVOIR-FAIRE
# ================================================================

@bp.post(
    "/competences/<int:competence_id>/savoir-faires"
)
def create_savoir_faire(
    competence_id
):

    Competence.query.get_or_404(
        competence_id
    )

    data = request.get_json() or {}

    if not data.get("description"):
        return jsonify({
            "error":
                "La description est obligatoire"
        }), 400

    savoir = SavoirFaire(
        competence_id=competence_id,
        code=data.get("code"),
        description=data[
            "description"
        ],
        ordre=data.get(
            "ordre",
            0
        )
    )

    db.session.add(savoir)
    db.session.commit()

    return jsonify(
        savoir.to_dict()
    ), 201


@bp.delete(
    "/savoir-faires/<int:savoir_id>"
)
def delete_savoir_faire(
    savoir_id
):

    savoir = SavoirFaire.query.get_or_404(
        savoir_id
    )

    db.session.delete(savoir)
    db.session.commit()

    return "", 204

