import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from extensions import db
from models import Ressource, Cours, Classe
from workspace import current_teacher_id

bp = Blueprint("ressources", __name__, url_prefix="/api")

ALLOWED_PDF_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
}


def is_valid_pdf(file):
    filename = (file.filename or "").lower()
    if not filename.endswith(".pdf"):
        return False
    mime_type = (file.mimetype or "").lower()
    return mime_type in ALLOWED_PDF_MIME_TYPES or mime_type.endswith("pdf")


@bp.post("/cours/<int:cours_id>/ressources")
def upload_ressource(cours_id):
    Cours.query.join(Classe).filter(Cours.id == cours_id, Classe.owner_id == current_teacher_id()).first_or_404()
    if "file" not in request.files:
        return jsonify({"error": "Aucun fichier envoyé"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide"}), 400
    if not is_valid_pdf(file):
        return jsonify({"error": "Seuls les fichiers PDF sont autorisés."}), 400

    ext = os.path.splitext(file.filename)[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], str(cours_id))
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, stored_name)
    file.save(dest_path)

    ressource = Ressource(
        cours_id=cours_id,
        nom_fichier=file.filename,
        chemin_fichier=os.path.join(str(cours_id), stored_name),
        type_fichier=ext.replace(".", "").lower(),
    )
    db.session.add(ressource)
    db.session.commit()
    return jsonify(ressource.to_dict()), 201


@bp.get("/ressources/<int:ressource_id>/telecharger")
def download_ressource(ressource_id):
    ressource = Ressource.query.join(Cours).join(Classe).filter(Ressource.id == ressource_id, Classe.owner_id == current_teacher_id()).first_or_404()
    directory = os.path.dirname(os.path.join(current_app.config["UPLOAD_FOLDER"], ressource.chemin_fichier))
    filename = os.path.basename(ressource.chemin_fichier)
    return send_from_directory(directory, filename, as_attachment=True, download_name=ressource.nom_fichier)


@bp.delete("/ressources/<int:ressource_id>")
def delete_ressource(ressource_id):
    ressource = Ressource.query.join(Cours).join(Classe).filter(Ressource.id == ressource_id, Classe.owner_id == current_teacher_id()).first_or_404()
    full_path = os.path.join(current_app.config["UPLOAD_FOLDER"], ressource.chemin_fichier)
    if os.path.exists(full_path):
        os.remove(full_path)
    db.session.delete(ressource)
    db.session.commit()
    return "", 204
