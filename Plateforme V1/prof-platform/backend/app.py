import os
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import inspect, text

from config import Config
from extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(app)  # ouvert en local uniquement (usage mono-utilisateur sur localhost)
    db.init_app(app)

    # Import all blueprints
    from routes.auth import bp as auth_bp
    from routes.competences import bp as competences_bp
    from routes.activites import bp as activites_bp
    from routes.evaluations import bp as evaluations_competences_bp
    from routes.classes import bp as classes_bp
    from routes.categories import bp as categories_bp
    from routes.eleves import bp as eleves_bp
    from routes.cours import bp as cours_bp
    from routes.ressources import bp as ressources_bp
    from routes.seances import bp as seances_bp
    from routes.planning import bp as planning_bp
    from routes.dashboard import bp as dashboard_bp
    from routes.messages import bp as messages_bp

    # Register all blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(competences_bp)
    app.register_blueprint(activites_bp)
    app.register_blueprint(evaluations_competences_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(eleves_bp)
    app.register_blueprint(cours_bp)
    app.register_blueprint(ressources_bp)
    app.register_blueprint(seances_bp)
    app.register_blueprint(planning_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(messages_bp)

    with app.app_context():
        db.create_all()
        from routes.auth import ensure_default_teacher
        ensure_default_teacher()
        _upgrade_tracking_schema()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


def _upgrade_tracking_schema():
    """Ajoute les colonnes introduites après la première version du suivi."""
    inspector = inspect(db.engine)
    classe_columns = {column["name"] for column in inspector.get_columns("classes")}
    if "owner_id" not in classe_columns:
        db.session.execute(text("ALTER TABLE classes ADD COLUMN owner_id INTEGER NOT NULL DEFAULT 1"))
    else:
        db.session.execute(text("UPDATE classes SET owner_id = 1 WHERE owner_id IS NULL"))
    if db.engine.dialect.name == "mysql":
        unique_constraints = inspector.get_unique_constraints("classes")
        old_nom_constraint = next(
            (item.get("name") for item in unique_constraints if item.get("column_names") == ["nom"]),
            None,
        )
        if old_nom_constraint:
            db.session.execute(text(f"ALTER TABLE classes DROP INDEX `{old_nom_constraint}`"))
        indexes = inspector.get_indexes("classes")
        if not any(item.get("name") == "uq_classes_owner_nom" for item in indexes):
            db.session.execute(text("ALTER TABLE classes ADD UNIQUE INDEX uq_classes_owner_nom (owner_id, nom)"))

    seance_columns = {column["name"] for column in inspector.get_columns("seances")}
    if "groupe" not in seance_columns:
        db.session.execute(text("ALTER TABLE seances ADD COLUMN groupe VARCHAR(30) NOT NULL DEFAULT 'Toute la classe'"))

    suivi_columns = {column["name"] for column in inspector.get_columns("activites_suivis")}
    if "statut" not in suivi_columns:
        db.session.execute(text("ALTER TABLE activites_suivis ADD COLUMN statut VARCHAR(20) NOT NULL DEFAULT 'a_commencer'"))
        if "fait" in suivi_columns:
            db.session.execute(text("UPDATE activites_suivis SET statut = 'terminee' WHERE fait = 1"))
    seance_columns = {column["name"] for column in inspector.get_columns("seances")}
    if "statut" not in seance_columns:
        db.session.execute(text("ALTER TABLE seances ADD COLUMN statut VARCHAR(20) NOT NULL DEFAULT 'planifiee'"))

    activite_columns = {column["name"] for column in inspector.get_columns("activites")}
    if "rendu_aux_eleves" not in activite_columns:
        db.session.execute(text("ALTER TABLE activites ADD COLUMN rendu_aux_eleves BOOLEAN NOT NULL DEFAULT FALSE"))
    if "rendu_at" not in activite_columns:
        db.session.execute(text("ALTER TABLE activites ADD COLUMN rendu_at DATETIME NULL"))

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    user_definitions = {
        "email": "VARCHAR(255) NULL",
        "filiere": "VARCHAR(120) NOT NULL DEFAULT 'CIEL'",
        "email_verifie": "BOOLEAN NOT NULL DEFAULT TRUE",
        "compte_approuve": "BOOLEAN NOT NULL DEFAULT TRUE",
        "code_verification": "VARCHAR(255) NULL",
    }
    for column_name, definition in user_definitions.items():
        if column_name not in user_columns:
            db.session.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {definition}"))

    classe_columns = {column["name"] for column in inspector.get_columns("classes")}
    if "filiere" not in classe_columns:
        db.session.execute(text("ALTER TABLE classes ADD COLUMN filiere VARCHAR(120) NULL"))

    domaine_columns = {column["name"] for column in inspector.get_columns("domaines_competences")}
    if "filiere" not in domaine_columns:
        db.session.execute(text("ALTER TABLE domaines_competences ADD COLUMN filiere VARCHAR(120) NOT NULL DEFAULT 'CIEL'"))
    competence_columns = {column["name"] for column in inspector.get_columns("competences")}
    if "filiere" not in competence_columns:
        db.session.execute(text("ALTER TABLE competences ADD COLUMN filiere VARCHAR(120) NOT NULL DEFAULT 'CIEL'"))
    categorie_columns = {column["name"] for column in inspector.get_columns("categories")}
    if "filiere" not in categorie_columns:
        db.session.execute(text("ALTER TABLE categories ADD COLUMN filiere VARCHAR(120) NULL"))
    if "owner_id" not in categorie_columns:
        db.session.execute(text("ALTER TABLE categories ADD COLUMN owner_id INTEGER NULL"))
    # Les catégories créées avant l'ajout de la filière/du multi-enseignant appartiennent
    # à l'organisation historique du compte n°1 : elles ne doivent pas être héritées par
    # les nouveaux enseignants, qui doivent construire leurs propres catégories.
    db.session.execute(text(
        "UPDATE categories SET filiere = 'CIEL', owner_id = 1 WHERE owner_id IS NULL"
    ))

    if db.engine.dialect.name == "mysql":
        for table_name, column_name in (
            ("domaines_competences", "code"),
            ("competences", "code"),
            ("categories", "code"),
        ):
            unique_indexes = inspector.get_indexes(table_name)
            for index in unique_indexes:
                if index.get("unique") and index.get("column_names") == [column_name]:
                    db.session.execute(text(f"ALTER TABLE {table_name} DROP INDEX `{index['name']}`"))
    evaluation_columns = {column["name"] for column in inspector.get_columns("evaluations_competences")}
    if "appreciation_id" not in evaluation_columns:
        db.session.execute(text("ALTER TABLE evaluations_competences ADD COLUMN appreciation_id INTEGER NULL"))
    db.session.commit()


app = create_app()

if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
