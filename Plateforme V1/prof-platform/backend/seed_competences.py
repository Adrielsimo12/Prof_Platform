"""
Script pour charger les compétences CIEL dans la base de données.

Usage :
    python seed_competences.py

À lancer APRÈS seed.py pour ajouter le référentiel de compétences.
"""

from app import create_app
from extensions import db
from models import DomaineCompetence, Competence

# Domaine global (il n'y a qu'un seul domaine pour les compétences CIEL)
DOMAINE_PRINCIPAL = {
    "code": "CIEL",
    "nom": "Compétences CIEL",
    "description": "Référentiel des compétences du BTS Cybersécurité, Informatique et réseaux, Électronique",
    "ordre": 0,
}

# Liste complète des compétences
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
        # Créer les tables si nécessaire
        db.create_all()
        print("Tables vérifiées/créées.")
        
        # Créer ou récupérer le domaine CIEL
        domaine = DomaineCompetence.query.filter_by(
            code=DOMAINE_PRINCIPAL["code"]
        ).first()

        if not domaine:
            domaine = DomaineCompetence(
                code=DOMAINE_PRINCIPAL["code"],
                nom=DOMAINE_PRINCIPAL["nom"],
                description=DOMAINE_PRINCIPAL["description"],
                ordre=DOMAINE_PRINCIPAL["ordre"],
            )
            db.session.add(domaine)
            db.session.commit()
            print(f"✓ Domaine créé : {DOMAINE_PRINCIPAL['nom']}")
        else:
            print(f"✓ Domaine existant : {DOMAINE_PRINCIPAL['nom']}")

        # Ajouter les compétences
        created = 0
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
                created += 1
                print(f"  ✓ {comp_data['code']} - {comp_data['nom']}")
            else:
                print(f"  ~ {comp_data['code']} - (existe déjà)")

        if created > 0:
            db.session.commit()
            print(f"\n✓ {created} compétences créées avec succès !")
        else:
            print("\n✓ Toutes les compétences sont déjà présentes.")


if __name__ == "__main__":
    run()
