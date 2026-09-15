from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
import csv
import io
import unicodedata

from extensions import db
from models import Seance, Classe
from workspace import current_teacher_id

bp = Blueprint("planning", __name__, url_prefix="/api/planning")


def _header(value):
    value = unicodedata.normalize("NFKD", value or "")
    return "".join(char for char in value if not unicodedata.combining(char)).strip().lower().replace(" ", "_")


def _parse_csv_date(value):
    value = (value or "").strip()
    for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            continue
    return None


@bp.post("/import")
def import_planning():
    data = request.get_json() or {}
    content = data.get("content", "")
    if not content.strip():
        return jsonify({"error": "Le fichier CSV est vide."}), 400

    sample = content[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=";,\t")
    except csv.Error:
        dialect = csv.excel
        dialect.delimiter = ";"
    reader = csv.DictReader(io.StringIO(content.lstrip("\ufeff")), dialect=dialect)

    owner_id = current_teacher_id()
    created = 0
    skipped = []
    class_cache = {}
    for line_number, raw_row in enumerate(reader, start=2):
        row = {_header(key): (value or "").strip() for key, value in raw_row.items() if key}
        date = _parse_csv_date(row.get("date") or row.get("jour"))
        classe_name = row.get("classe") or row.get("class")
        start = row.get("heure_debut") or row.get("debut") or row.get("heure")
        end = row.get("heure_fin") or row.get("fin")
        title = row.get("titre") or row.get("cours") or row.get("matiere") or "Séance importée"
        if not date or not classe_name or not start:
            skipped.append(line_number)
            continue

        classe_key = classe_name.casefold()
        classe = class_cache.get(classe_key)
        if classe is None:
            classe = Classe.query.filter_by(owner_id=owner_id, nom=classe_name).first()
            if classe is None:
                classe = Classe(nom=classe_name, owner_id=owner_id)
                db.session.add(classe)
                db.session.flush()
            class_cache[classe_key] = classe

        groupe = row.get("groupe") or "Toute la classe"
        if groupe.upper() == "Q1":
            groupe = "Groupe 1"
        elif groupe.upper() == "Q2":
            groupe = "Groupe 2"
        contenu = title
        if row.get("salle"):
            contenu = f"{title} · {row['salle']}"
        db.session.add(Seance(
            classe_id=classe.id,
            date=date,
            heure_debut=start,
            heure_fin=end or None,
            groupe=groupe,
            statut=row.get("statut") or "planifiee",
            contenu_realise=contenu,
        ))
        created += 1

    if not created:
        db.session.rollback()
        return jsonify({"error": "Aucune ligne valide. Colonnes attendues : date, classe, heure_debut, heure_fin, titre."}), 400
    db.session.commit()
    return jsonify({"created": created, "skipped": skipped, "message": f"{created} séance(s) importée(s)."})


@bp.get("/semaine")
def semaine():
    """Retourne les séances d'une semaine donnée.
    Paramètre : ?date=YYYY-MM-DD (un jour quelconque de la semaine ciblée)
    """
    date_str = request.args.get("date")
    ref_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else datetime.utcnow().date()

    lundi = ref_date - timedelta(days=ref_date.weekday())
    dimanche = lundi + timedelta(days=6)

    seances = (
        Seance.query.join(Classe).filter(Classe.owner_id == current_teacher_id(), Seance.date >= lundi, Seance.date <= dimanche)
        .order_by(Seance.date, Seance.heure_debut)
        .all()
    )

    return jsonify({
        "debut_semaine": lundi.isoformat(),
        "fin_semaine": dimanche.isoformat(),
        "seances": [s.to_dict() for s in seances],
    })
