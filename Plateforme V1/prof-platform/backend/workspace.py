from flask import request
from models import User


def current_teacher_id():
    raw_id = request.headers.get("X-Teacher-Id")
    try:
        teacher_id = int(raw_id)
    except (TypeError, ValueError):
        teacher_id = 1
    user = User.query.filter(User.id == teacher_id, User.role.in_(["enseignant", "admin"])).first()
    return user.id if user else 1


def current_teacher():
    return User.query.get(current_teacher_id())


def current_user():
    return User.query.filter(User.id == current_teacher_id()).first()


def is_admin():
    user = current_user()
    return bool(user and user.role == "admin")
