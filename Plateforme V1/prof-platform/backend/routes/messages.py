import os
import uuid

from flask import Blueprint, current_app, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from extensions import db
from models import Message, User
from workspace import current_user

bp = Blueprint("messages", __name__, url_prefix="/api/messages")


@bp.get("/users")
def list_message_users():
    user = current_user()
    users = User.query.filter(User.id != user.id, User.compte_approuve.is_(True)).order_by(User.nom, User.username).all()
    return jsonify([item.to_dict() for item in users])


@bp.get("/<int:user_id>")
def list_messages(user_id):
    user = current_user()
    User.query.filter_by(id=user_id, compte_approuve=True).first_or_404()
    messages = Message.query.filter(
        ((Message.sender_id == user.id) & (Message.recipient_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.recipient_id == user.id))
    ).order_by(Message.envoye_le.asc()).all()
    return jsonify([message.to_dict() for message in messages])


@bp.post("/<int:user_id>")
def send_message(user_id):
    user = current_user()
    User.query.filter_by(id=user_id, compte_approuve=True).first_or_404()
    contenu = (request.form.get("contenu") or "").strip()
    fichier = request.files.get("fichier")
    if not contenu and not fichier:
        return jsonify({"error": "Le message ou un fichier est obligatoire."}), 400

    message = Message(sender_id=user.id, recipient_id=user_id, contenu=contenu)
    if fichier and fichier.filename:
        safe_name = secure_filename(fichier.filename)
        if not safe_name:
            return jsonify({"error": "Nom de fichier invalide."}), 400
        stored_name = f"{uuid.uuid4().hex}_{safe_name}"
        messages_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "messages")
        os.makedirs(messages_folder, exist_ok=True)
        fichier.save(os.path.join(messages_folder, stored_name))
        message.nom_fichier = safe_name
        message.chemin_fichier = stored_name
        message.type_fichier = fichier.mimetype

    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201


@bp.get("/<int:message_id>/fichier")
def download_message_file(message_id):
    user = current_user()
    message = Message.query.filter(
        Message.id == message_id,
        ((Message.sender_id == user.id) | (Message.recipient_id == user.id)),
    ).first_or_404()
    if not message.chemin_fichier:
        return jsonify({"error": "Aucun fichier associé."}), 404
    return send_from_directory(
        os.path.join(current_app.config["UPLOAD_FOLDER"], "messages"),
        message.chemin_fichier,
        download_name=message.nom_fichier,
    )