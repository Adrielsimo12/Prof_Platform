"""
Script à lancer une seule fois pour initialiser la base de données :
- crée les tables
- crée les 3 classes de départ
- crée les 5 catégories de cours
- crée le domaine et les 11 compétences CIEL

Usage :
    python seed.py
"""

from app import create_app
from extensions import db
from models import Classe, Categorie, DomaineCompetence, Competence

CLASSES_INITIALES = ["2 TNE", "1 CIEL", "T CIEL", "06 - CIEL DIVERS"]

CATEGORIES_INITIALES = [
    ("01", "Electronique"),
    ("02", "Informatique"),
    ("03", "Réseaux"),
    ("04", "Cybersécurité"),
    ("05", "Projets"),
    ("06", "CIEL DIVERS"),
]

DOMAINE_PRINCIPAL = {
    "code": "CIEL",
    "nom": "Compétences CIEL",
    "description": "Référentiel des compétences du BTS Cybersécurité, Informatique et réseaux, Électronique",
    "ordre": 0,
}

COMPETENCES_INITIALES = [
    {
        "code": "C01",
        "nom": "COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)",
        "description": "Communiquer en situation professionnelle en français et en anglais",
        "ordre": 1,
    },
    {
        "code": "C02",
        "nom": "ORGANISER",
        "description": "Compétence relevant d'un niveau 5 - Organiser",
        "ordre": 2,
    },
    {
        "code": "C03",
        "nom": "PARTICIPER A UN PROJET",
        "description": "Participer à un projet",
        "ordre": 3,
    },
    {
        "code": "C04",
        "nom": "ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE",
        "description": "Analyser une structure matérielle et logicielle",
        "ordre": 4,
    },
    {
        "code": "C05",
        "nom": "CONCEVOIR",
        "description": "Compétence relevant d'un niveau 5 - Concevoir",
        "ordre": 5,
    },
    {
        "code": "C06",
        "nom": "VALIDER LA CONFORMITÉ D'UNE INSTALLATION",
        "description": "Valider la conformité d'une installation",
        "ordre": 6,
    },
    {
        "code": "C07",
        "nom": "RÉALISER DES MAQUETTES ET PROTOTYPES",
        "description": "Réaliser des maquettes et prototypes",
        "ordre": 7,
    },
    {
        "code": "C08",
        "nom": "CODER",
        "description": "Coder",
        "ordre": 8,
    },
    {
        "code": "C09",
        "nom": "INSTALLER LES ÉLÉMENTS D'UN SYSTÈME ÉLECTRONIQUE OU INFORMATIQUE",
        "description": "Installer les éléments d'un système électronique ou informatique",
        "ordre": 9,
    },
    {
        "code": "C10",
        "nom": "EXPLOITER UN RÉSEAU INFORMATIQUE",
        "description": "Exploiter un réseau informatique",
        "ordre": 10,
    },
    {
        "code": "C11",
        "nom": "MAINTENIR UN SYSTÈME ÉLECTRONIQUE OU RÉSEAU INFORMATIQUE",
        "description": "Maintenir un système électronique ou réseau informatique",
        "ordre": 11,
    },
]


def run():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Tables créées (ou déjà existantes).")

        for nom in CLASSES_INITIALES:
            if not Classe.query.filter_by(nom=nom).first():
                db.session.add(Classe(nom=nom))
                print(f"Classe créée : {nom}")

        for code, nom in CATEGORIES_INITIALES:
            if not Categorie.query.filter_by(code=code, filiere="CIEL", owner_id=1).first():
                db.session.add(Categorie(code=code, nom=nom, filiere="CIEL", owner_id=1))
                print(f"Catégorie créée : {code} - {nom}")

        # Créer le domaine des compétences
        domaine = DomaineCompetence.query.filter_by(code=DOMAINE_PRINCIPAL["code"]).first()
        if not domaine:
            domaine = DomaineCompetence(
                code=DOMAINE_PRINCIPAL["code"],
                nom=DOMAINE_PRINCIPAL["nom"],
                description=DOMAINE_PRINCIPAL["description"],
                ordre=DOMAINE_PRINCIPAL["ordre"],
            )
            db.session.add(domaine)
            db.session.flush()  # Pour obtenir l'ID du domaine
            print(f"Domaine créé : {DOMAINE_PRINCIPAL['nom']}")

        # Ajouter les compétences
        for comp_data in COMPETENCES_INITIALES:
            if not Competence.query.filter_by(code=comp_data["code"]).first():
                competence = Competence(
                    domaine_id=domaine.id,
                    code=comp_data["code"],
                    nom=comp_data["nom"],
                    description=comp_data["description"],
                    ordre=comp_data["ordre"],
                )
                db.session.add(competence)
                print(f"  Compétence créée : {comp_data['code']} - {comp_data['nom'][:50]}...")

        db.session.commit()
        print("Initialisation terminée.")


if __name__ == "__main__":
    run()
