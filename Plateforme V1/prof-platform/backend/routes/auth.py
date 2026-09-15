import hashlib
import secrets
import smtplib
from email.message import EmailMessage

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import text

from extensions import db
from models import User
from workspace import is_admin

bp = Blueprint("auth", __name__, url_prefix="/api")


def ensure_default_teacher():
    user = User.query.filter_by(username="enseignant").first()
    if user is None:
        user = User(username="enseignant", nom="Enseignant")
        user.set_password("enseignant")
        db.session.add(user)
        db.session.commit()
    return user


def _send_verification_email(user, code):
    host = current_app.config.get("SMTP_HOST")
    if not host:
        return False
    message = EmailMessage()
    message["Subject"] = "Validation de votre compte enseignant"
    message["From"] = current_app.config["SMTP_FROM"]
    message["To"] = user.email
    message.set_content(f"Bonjour {user.nom},\n\nVotre code de validation est : {code}\n\nCe code est valable pour cette inscription.")
    with smtplib.SMTP(host, current_app.config["SMTP_PORT"]) as server:
        server.starttls()
        if current_app.config.get("SMTP_USER"):
            server.login(current_app.config["SMTP_USER"], current_app.config["SMTP_PASSWORD"])
        server.send_message(message)
    return True


@bp.post("/register")
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    nom = (data.get("nom") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    filiere = (data.get("filiere") or "CIEL").strip() or "CIEL"
    if not username or not nom or not email or not password:
        return jsonify({"error": "Nom, identifiant, email et mot de passe sont obligatoires."}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Cet identifiant ou cet email existe déjà."}), 409

    code = f"{secrets.randbelow(1000000):06d}"
    user = User(
        username=username,
        nom=nom,
        email=email,
        filiere=filiere,
        role="enseignant",
        email_verifie=False,
        compte_approuve=False,
        code_verification=hashlib.sha256(code.encode()).hexdigest(),
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    try:
        sent = _send_verification_email(user, code)
    except (OSError, smtplib.SMTPException):
        sent = False
    response = {"message": "Compte créé. Validez votre adresse email puis attendez l'approbation d'un administrateur."}
    if not sent:
        response["message"] = "Email non envoyé : utilisez le code affiché pour valider votre compte, puis corrigez les identifiants SMTP."
        response["verification_code"] = code
    return jsonify(response), 201


@bp.post("/resend-verification")
def resend_verification():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    user = User.query.filter_by(username=username).first()
    if not user or user.email_verifie:
        return jsonify({"error": "Compte introuvable ou email déjà validé."}), 404

    code = f"{secrets.randbelow(1000000):06d}"
    user.code_verification = hashlib.sha256(code.encode()).hexdigest()
    db.session.commit()
    try:
        sent = _send_verification_email(user, code)
    except (OSError, smtplib.SMTPException):
        sent = False
    response = {"message": "Un nouveau code a été envoyé."}
    if not sent:
        response["message"] = "Email non envoyé : utilisez le code affiché pour valider votre compte, puis corrigez les identifiants SMTP."
        response["verification_code"] = code
    return jsonify(response)


@bp.post("/verify-email")
def verify_email():
    data = request.get_json() or {}
    user = User.query.filter_by(username=(data.get("username") or "").strip()).first()
    code = (data.get("code") or "").strip()
    if not user or not user.code_verification or not secrets.compare_digest(user.code_verification, hashlib.sha256(code.encode()).hexdigest()):
        return jsonify({"error": "Code de validation incorrect."}), 400
    user.email_verifie = True
    user.code_verification = None
    db.session.commit()
    return jsonify({"message": "Email validé. Un administrateur doit maintenant approuver le compte."})


@bp.get("/teachers")
def list_teachers():
    teachers = User.query.filter(User.role.in_(["enseignant", "admin"]), User.compte_approuve.is_(True)).order_by(User.username.asc()).all()
    return jsonify({"teachers": [teacher.to_dict() for teacher in teachers]})


@bp.get("/teachers/pending")
def pending_teachers():
    if not is_admin():
        return jsonify({"error": "Droits administrateur requis."}), 403
    users = User.query.filter_by(compte_approuve=False).order_by(User.created_at.asc()).all()
    return jsonify({"teachers": [user.to_dict() for user in users]})


@bp.post("/teachers")
def create_teacher():
    if not is_admin():
        return jsonify({"error": "Droits administrateur requis."}), 403
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    nom = (data.get("nom") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Nom d'utilisateur et mot de passe requis."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Ce nom d'utilisateur existe déjà."}), 409

    role = data.get("role") or "enseignant"
    if role not in {"enseignant", "admin"}:
        return jsonify({"error": "Rôle invalide."}), 400
    teacher = User(username=username, nom=nom or username, role=role, email_verifie=True, compte_approuve=True, filiere=data.get("filiere") or "CIEL")
    teacher.set_password(password)
    db.session.add(teacher)
    db.session.commit()

    return jsonify({"teacher": teacher.to_dict(), "message": "Compte enseignant créé."}), 201


@bp.post("/teachers/<int:user_id>/approve")
def approve_teacher(user_id):
    if not is_admin():
        return jsonify({"error": "Droits administrateur requis."}), 403
    teacher = User.query.get(user_id)
    if not teacher:
        return jsonify({"error": "Enseignant introuvable."}), 404
    data = request.get_json() or {}
    role = data.get("role") or "enseignant"
    if role not in {"enseignant", "admin"}:
        return jsonify({"error": "Rôle invalide."}), 400
    teacher.role = role
    teacher.compte_approuve = True
    db.session.commit()
    return jsonify({"teacher": teacher.to_dict(), "message": "Compte approuvé."})


@bp.put("/teachers/<int:user_id>/password")
def update_teacher_password(user_id):
    if not is_admin():
        return jsonify({"error": "Droits administrateur requis."}), 403
    data = request.get_json() or {}
    new_password = data.get("password") or ""

    if not new_password:
        return jsonify({"error": "Le nouveau mot de passe est requis."}), 400

    teacher = User.query.get(user_id)
    if not teacher or teacher.role != "enseignant":
        return jsonify({"error": "Enseignant introuvable."}), 404

    teacher.set_password(new_password)
    db.session.commit()
    return jsonify({"teacher": teacher.to_dict(), "message": "Mot de passe mis à jour."})


@bp.delete("/teachers/<int:user_id>")
def delete_teacher(user_id):
    if not is_admin():
        return jsonify({"error": "Droits administrateur requis."}), 403
    teacher = User.query.filter(User.id == user_id, User.role.in_(["enseignant", "admin"])).first()
    if not teacher:
        return jsonify({"error": "Enseignant introuvable."}), 404

    # Nettoyage explicite nécessaire pour les anciennes bases dont les FK
    # n'ont pas toutes été créées avec ON DELETE CASCADE.
    statements = [
        "DELETE FROM messages WHERE sender_id = :user_id OR recipient_id = :user_id",
        "DELETE FROM presences WHERE seance_id IN (SELECT id FROM seances WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM evaluations_competences WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)) OR activite_id IN (SELECT id FROM activites WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM evaluations_activites WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)) OR activite_id IN (SELECT id FROM activites WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM activites_suivis WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)) OR activite_id IN (SELECT id FROM activites WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM activites_competences WHERE activite_id IN (SELECT id FROM activites WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM groupes_eleves WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM observations_eleve WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM travaux WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM evaluations WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM ressources WHERE cours_id IN (SELECT id FROM cours WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id))",
        "DELETE FROM seances WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)",
        "DELETE FROM activites WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)",
        "DELETE FROM cours WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)",
        "DELETE FROM eleves WHERE classe_id IN (SELECT id FROM classes WHERE owner_id = :user_id)",
        "DELETE FROM classes WHERE owner_id = :user_id",
        "DELETE FROM users WHERE id = :user_id",
    ]
    for statement in statements:
        db.session.execute(text(statement), {"user_id": user_id})
    db.session.commit()
    return "", 204


@bp.post("/login")
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Nom d'utilisateur et mot de passe requis."}), 400

    user = User.query.filter_by(username=username).first()
    if not user or user.role not in {"enseignant", "admin"}:
        return jsonify({"error": "Accès refusé."}), 401

    if not user.email_verifie:
        return jsonify({"error": "Validez d'abord votre adresse email."}), 403
    if not user.compte_approuve:
        return jsonify({"error": "Votre compte attend l'approbation d'un administrateur."}), 403

    if not user.check_password(password):
        return jsonify({"error": "Mot de passe incorrect."}), 401

    return jsonify({
        "user": user.to_dict(),
        "message": "Connexion réussie."
    })


@bp.get("/me")
def me():
    user_id = request.args.get("user_id")
    user = None

    if user_id:
        user = User.query.get(int(user_id))

    if user is None:
        user = ensure_default_teacher()

    return jsonify({"user": user.to_dict()})
