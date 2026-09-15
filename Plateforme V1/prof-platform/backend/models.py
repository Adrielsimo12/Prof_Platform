from datetime import datetime
from werkzeug.security import generate_password_hash

from extensions import db


def now():
    return datetime.utcnow()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), default="enseignant")
    nom = db.Column(db.String(120))
    email = db.Column(db.String(255), unique=True)
    filiere = db.Column(db.String(120), default="CIEL", nullable=False)
    email_verifie = db.Column(db.Boolean, default=True, nullable=False)
    compte_approuve = db.Column(db.Boolean, default=True, nullable=False)
    code_verification = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=now)

    classes = db.relationship("Classe", backref="owner", cascade="all, delete-orphan")
    sent_messages = db.relationship("Message", foreign_keys="Message.sender_id", backref="sender")
    received_messages = db.relationship("Message", foreign_keys="Message.recipient_id", backref="recipient")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "nom": self.nom,
            "role": self.role,
            "email": self.email,
            "filiere": self.filiere,
            "email_verifie": self.email_verifie,
            "compte_approuve": self.compte_approuve,
        }


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    contenu = db.Column(db.Text, default="", nullable=False)
    nom_fichier = db.Column(db.String(255))
    chemin_fichier = db.Column(db.String(500))
    type_fichier = db.Column(db.String(120))
    envoye_le = db.Column(db.DateTime, default=now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "contenu": self.contenu,
            "nom_fichier": self.nom_fichier,
            "type_fichier": self.type_fichier,
            "envoye_le": self.envoye_le.isoformat() if self.envoye_le else None,
            "download_url": f"/api/messages/{self.id}/fichier" if self.nom_fichier else None,
        }


class Classe(db.Model):
    __tablename__ = "classes"
    __table_args__ = (db.UniqueConstraint("owner_id", "nom", name="uq_classes_owner_nom"),)

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    annee_scolaire = db.Column(db.String(20), default="2026-2027")
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=now)

    eleves = db.relationship("Eleve", backref="classe", cascade="all, delete-orphan")
    cours = db.relationship("Cours", backref="classe", cascade="all, delete-orphan")
    seances = db.relationship("Seance", backref="classe", cascade="all, delete-orphan")

    def to_dict(self, with_counts=False):
        data = {
            "id": self.id,
            "nom": self.nom,
            "annee_scolaire": self.annee_scolaire,
            "owner_id": self.owner_id,
        }
        if with_counts:
            data["nb_eleves"] = len(self.eleves)
            data["nb_cours"] = len(self.cours)
        return data


class Categorie(db.Model):
    """Les 5 catégories de cours (01 - Electronique, etc.)"""

    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(5), nullable=False, unique=True)  # "01", "02", ...
    nom = db.Column(db.String(100), nullable=False)

    cours = db.relationship("Cours", backref="categorie")

    def to_dict(self):
        return {"id": self.id, "code": self.code, "nom": self.nom}


class Eleve(db.Model):
    __tablename__ = "eleves"

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(80), nullable=False)
    prenom = db.Column(db.String(80), nullable=False)
    classe_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    email = db.Column(db.String(150))
    date_naissance = db.Column(db.Date)
    actif = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=now)

    presences = db.relationship("Presence", backref="eleve", cascade="all, delete-orphan")
    evaluations = db.relationship("Evaluation", backref="eleve", cascade="all, delete-orphan")
    observations = db.relationship("Observation", backref="eleve", cascade="all, delete-orphan")
    travaux = db.relationship("Travail", backref="eleve", cascade="all, delete-orphan")
    groupe_affectation = db.relationship("GroupeEleve", backref="eleve", uselist=False, cascade="all, delete-orphan")

    def to_dict(self, full=False):
        data = {
            "id": self.id,
            "nom": self.nom,
            "prenom": self.prenom,
            "classe_id": self.classe_id,
            "classe_nom": self.classe.nom if self.classe else None,
            "email": self.email,
            "date_naissance": self.date_naissance.isoformat() if self.date_naissance else None,
            "actif": self.actif,
            "groupe": self.groupe_affectation.groupe if self.groupe_affectation else None,
        }
        if full:
            data["nb_absences"] = sum(1 for p in self.presences if p.statut == "absent")
            data["nb_retards"] = sum(1 for p in self.presences if p.statut == "retard")
            data["moyenne"] = (
                round(sum(e.note for e in self.evaluations if e.note is not None)
                      / max(1, len([e for e in self.evaluations if e.note is not None])), 2)
                if any(e.note is not None for e in self.evaluations) else None
            )
        return data


class GroupeEleve(db.Model):
    __tablename__ = "groupes_eleves"
    __table_args__ = (db.UniqueConstraint("eleve_id", name="uq_groupes_eleves_eleve"),)

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    groupe = db.Column(db.String(30), nullable=False)


class ActiviteSuivi(db.Model):
    __tablename__ = "activites_suivis"
    __table_args__ = (db.UniqueConstraint("activite_id", "eleve_id", name="uq_activite_suivi_eleve"),)

    id = db.Column(db.Integer, primary_key=True)
    activite_id = db.Column(db.Integer, db.ForeignKey("activites.id"), nullable=False)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    statut = db.Column(db.String(20), default="a_commencer", nullable=False)

    def to_dict(self):
        return {
            "activite_id": self.activite_id,
            "eleve_id": self.eleve_id,
            "statut": self.statut,
            "fait": self.statut == "terminee",
        }


class Cours(db.Model):
    __tablename__ = "cours"

    id = db.Column(db.Integer, primary_key=True)
    classe_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    categorie_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    titre = db.Column(db.String(200), nullable=False)
    objectifs = db.Column(db.Text)
    contenu = db.Column(db.Text)
    exercices = db.Column(db.Text)
    tp = db.Column(db.Text)
    statut = db.Column(db.String(20), default="a_faire")  # a_faire / en_cours / termine
    ordre = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=now)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now)

    ressources = db.relationship("Ressource", backref="cours", cascade="all, delete-orphan")
    seances = db.relationship("Seance", backref="cours")
    evaluations = db.relationship("Evaluation", backref="cours")
    travaux = db.relationship("Travail", backref="cours")

    def to_dict(self, with_ressources=False):
        data = {
            "id": self.id,
            "classe_id": self.classe_id,
            "classe_nom": self.classe.nom if self.classe else None,
            "categorie_id": self.categorie_id,
            "categorie_code": self.categorie.code if self.categorie else None,
            "categorie_nom": self.categorie.nom if self.categorie else None,
            "titre": self.titre,
            "objectifs": self.objectifs,
            "contenu": self.contenu,
            "exercices": self.exercices,
            "tp": self.tp,
            "statut": self.statut,
            "ordre": self.ordre,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_ressources:
            data["ressources"] = [r.to_dict() for r in self.ressources]
        return data


class Ressource(db.Model):
    __tablename__ = "ressources"

    id = db.Column(db.Integer, primary_key=True)
    cours_id = db.Column(db.Integer, db.ForeignKey("cours.id"), nullable=False)
    nom_fichier = db.Column(db.String(255), nullable=False)
    chemin_fichier = db.Column(db.String(500), nullable=False)
    type_fichier = db.Column(db.String(50))
    uploaded_at = db.Column(db.DateTime, default=now)

    def to_dict(self):
        return {
            "id": self.id,
            "cours_id": self.cours_id,
            "nom_fichier": self.nom_fichier,
            "type_fichier": self.type_fichier,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "url": f"/api/ressources/{self.id}/telecharger",
        }


class Seance(db.Model):
    __tablename__ = "seances"

    id = db.Column(db.Integer, primary_key=True)
    classe_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey("cours.id"))
    groupe = db.Column(db.String(30), default="Toute la classe", nullable=False)
    statut = db.Column(db.String(20), default="planifiee", nullable=False)
    date = db.Column(db.Date, nullable=False)
    heure_debut = db.Column(db.String(5))  # "08:00"
    heure_fin = db.Column(db.String(5))
    contenu_realise = db.Column(db.Text)
    travail_donne = db.Column(db.Text)
    observations = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=now)

    presences = db.relationship("Presence", backref="seance", cascade="all, delete-orphan")

    def to_dict(self, with_presences=False):
        data = {
            "id": self.id,
            "classe_id": self.classe_id,
            "classe_nom": self.classe.nom if self.classe else None,
            "cours_id": self.cours_id,
            "cours_titre": self.cours.titre if self.cours else None,
            "groupe": self.groupe,
            "statut": self.statut,
            "date": self.date.isoformat() if self.date else None,
            "heure_debut": self.heure_debut,
            "heure_fin": self.heure_fin,
            "contenu_realise": self.contenu_realise,
            "travail_donne": self.travail_donne,
            "observations": self.observations,
        }
        if with_presences:
            data["presences"] = [p.to_dict() for p in self.presences]
            data["nb_absents"] = sum(1 for p in self.presences if p.statut == "absent")
        return data


class Presence(db.Model):
    __tablename__ = "presences"

    id = db.Column(db.Integer, primary_key=True)
    seance_id = db.Column(db.Integer, db.ForeignKey("seances.id"), nullable=False)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    statut = db.Column(db.String(20), default="present")  # present / absent / retard
    justifie = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "seance_id": self.seance_id,
            "eleve_id": self.eleve_id,
            "eleve_nom": self.eleve.nom if self.eleve else None,
            "eleve_prenom": self.eleve.prenom if self.eleve else None,
            "statut": self.statut,
            "justifie": self.justifie,
        }


class Evaluation(db.Model):
    __tablename__ = "evaluations"

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey("cours.id"))
    titre = db.Column(db.String(200))
    note = db.Column(db.Float)
    bareme = db.Column(db.Float, default=20)
    commentaire = db.Column(db.Text)
    date = db.Column(db.Date, default=lambda: datetime.utcnow().date())

    def to_dict(self):
        return {
            "id": self.id,
            "eleve_id": self.eleve_id,
            "cours_id": self.cours_id,
            "cours_titre": self.cours.titre if self.cours else None,
            "titre": self.titre,
            "note": self.note,
            "bareme": self.bareme,
            "commentaire": self.commentaire,
            "date": self.date.isoformat() if self.date else None,
        }


class Observation(db.Model):
    __tablename__ = "observations_eleve"

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    date = db.Column(db.Date, default=lambda: datetime.utcnow().date())
    categorie = db.Column(db.String(30), default="autre")  # comportement / travail / autre
    texte = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "eleve_id": self.eleve_id,
            "date": self.date.isoformat() if self.date else None,
            "categorie": self.categorie,
            "texte": self.texte,
        }


class Travail(db.Model):
    __tablename__ = "travaux"

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey("cours.id"))
    titre = db.Column(db.String(200), nullable=False)
    date_rendu = db.Column(db.Date)
    statut = db.Column(db.String(20), default="a_rendre")  # a_rendre / rendu / en_retard

    def to_dict(self):
        return {
            "id": self.id,
            "eleve_id": self.eleve_id,
            "cours_id": self.cours_id,
            "cours_titre": self.cours.titre if self.cours else None,
            "titre": self.titre,
            "date_rendu": self.date_rendu.isoformat() if self.date_rendu else None,
            "statut": self.statut,
        }


# ================================================================
# REFERENTIEL CIEL
# ================================================================

class DomaineCompetence(db.Model):
    """
    Domaine / bloc du référentiel CIEL.

    Exemple :
    - Préparer
    - Installer
    - Mettre en service
    - Maintenir
    - Communiquer

    Les intitulés exacts seront renseignés depuis le référentiel officiel.
    """

    __tablename__ = "domaines_competences"

    id = db.Column(db.Integer, primary_key=True)

    code = db.Column(
        db.String(30),
        nullable=False
    )

    filiere = db.Column(db.String(120), default="CIEL", nullable=False)

    nom = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    ordre = db.Column(
        db.Integer,
        default=0
    )

    competences = db.relationship(
        "Competence",
        backref="domaine",
        cascade="all, delete-orphan",
        order_by="Competence.ordre"
    )

    def to_dict(self, with_competences=False):

        data = {
            "id": self.id,
            "code": self.code,
            "filiere": self.filiere,
            "nom": self.nom,
            "description": self.description,
            "ordre": self.ordre,
        }

        if with_competences:
            data["competences"] = [
                c.to_dict()
                for c in self.competences
            ]

        return data


class Competence(db.Model):
    """
    Compétence du référentiel CIEL.
    """

    __tablename__ = "competences"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    domaine_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "domaines_competences.id"
        ),
        nullable=False
    )

    code = db.Column(
        db.String(30),
        nullable=False
    )

    filiere = db.Column(db.String(120), default="CIEL", nullable=False)

    nom = db.Column(
        db.String(250),
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    ordre = db.Column(
        db.Integer,
        default=0
    )

    savoir_faires = db.relationship(
        "SavoirFaire",
        backref="competence",
        cascade="all, delete-orphan",
        order_by="SavoirFaire.ordre"
    )

    activites = db.relationship(
        "ActiviteCompetence",
        backref="competence",
        cascade="all, delete-orphan"
    )

    evaluations = db.relationship(
        "EvaluationCompetence",
        backref="competence",
        cascade="all, delete-orphan"
    )

    def to_dict(
        self,
        with_savoir_faires=False
    ):

        data = {
            "id": self.id,
            "domaine_id": self.domaine_id,
            "domaine_nom": (
                self.domaine.nom
                if self.domaine
                else None
            ),
            "code": self.code,
            "filiere": self.filiere,
            "nom": self.nom,
            "description": self.description,
            "ordre": self.ordre,
        }

        if with_savoir_faires:
            data["savoir_faires"] = [
                s.to_dict()
                for s in self.savoir_faires
            ]

        return data


class SavoirFaire(db.Model):
    """
    Savoir-faire associé à une compétence CIEL.
    """

    __tablename__ = "savoir_faires"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    competence_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "competences.id"
        ),
        nullable=False
    )

    code = db.Column(
        db.String(50)
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    ordre = db.Column(
        db.Integer,
        default=0
    )

    def to_dict(self):

        return {
            "id": self.id,
            "competence_id":
                self.competence_id,
            "code": self.code,
            "description":
                self.description,
            "ordre": self.ordre,
        }


# ================================================================
# ACTIVITES PEDAGOGIQUES
# ================================================================

class Activite(db.Model):
    """
    Activité pédagogique créée par l'enseignant.

    L'IA ne génère pas automatiquement les activités.
    L'enseignant les crée et les rattache au référentiel.
    """

    __tablename__ = "activites"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    classe_id = db.Column(
        db.Integer,
        db.ForeignKey("classes.id"),
        nullable=False
    )

    cours_id = db.Column(
        db.Integer,
        db.ForeignKey("cours.id")
    )

    titre = db.Column(
        db.String(250),
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    contexte = db.Column(
        db.Text
    )

    consignes = db.Column(
        db.Text
    )

    production_attendue = db.Column(
        db.Text
    )

    criteres_reussite = db.Column(
        db.Text
    )

    date_debut = db.Column(
        db.Date
    )

    date_fin = db.Column(
        db.Date
    )

    statut = db.Column(
        db.String(30),
        default="a_faire"
    )

    rendu_aux_eleves = db.Column(db.Boolean, default=False, nullable=False)
    rendu_at = db.Column(db.DateTime)

    created_at = db.Column(
        db.DateTime,
        default=now
    )

    updated_at = db.Column(
        db.DateTime,
        default=now,
        onupdate=now
    )

    classe = db.relationship(
        "Classe",
        backref=db.backref(
            "activites",
            cascade="all, delete-orphan"
        )
    )

    cours = db.relationship(
        "Cours",
        backref="activites"
    )

    competences = db.relationship(
        "ActiviteCompetence",
        backref="activite",
        cascade="all, delete-orphan"
    )

    def to_dict(
        self,
        with_competences=True
    ):

        data = {
            "id": self.id,
            "classe_id":
                self.classe_id,
            "classe_nom":
                self.classe.nom
                if self.classe
                else None,
            "cours_id":
                self.cours_id,
            "cours_titre":
                self.cours.titre
                if self.cours
                else None,
            "titre": self.titre,
            "description":
                self.description,
            "contexte":
                self.contexte,
            "consignes":
                self.consignes,
            "production_attendue":
                self.production_attendue,
            "criteres_reussite":
                self.criteres_reussite,
            "date_debut":
                self.date_debut.isoformat()
                if self.date_debut
                else None,
            "date_fin":
                self.date_fin.isoformat()
                if self.date_fin
                else None,
            "statut": self.statut,
            "rendu_aux_eleves": self.rendu_aux_eleves,
            "rendu_at": self.rendu_at.isoformat() if self.rendu_at else None,
        }

        if with_competences:

            data["competences"] = [
                {
                    "id":
                        ac.competence.id,
                    "code":
                        ac.competence.code,
                    "nom":
                        ac.competence.nom,
                }
                for ac in self.competences
                if ac.competence
            ]

        return data


class ActiviteCompetence(db.Model):
    """
    Table de liaison Activité <-> Compétence.
    """

    __tablename__ = "activites_competences"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    activite_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "activites.id"
        ),
        nullable=False
    )

    competence_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "competences.id"
        ),
        nullable=False
    )

    def to_dict(self):

        return {
            "id": self.id,
            "activite_id":
                self.activite_id,
            "competence_id":
                self.competence_id,
        }


# ================================================================
# EVALUATION PAR COMPETENCE
# ================================================================

class EvaluationCompetence(db.Model):
    """
    Évaluation d'un élève sur une compétence.

    0 = Non acquis
    1 = En cours d'acquisition
    2 = Partiellement acquis
    3 = Acquis
    """

    __tablename__ = "evaluations_competences"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    eleve_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "eleves.id"
        ),
        nullable=False
    )

    competence_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "competences.id"
        ),
        nullable=False
    )

    activite_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "activites.id"
        )
    )

    niveau = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    commentaire = db.Column(
        db.Text
    )

    appreciation_id = db.Column(db.Integer, db.ForeignKey("appreciations.id"))

    date = db.Column(
        db.Date,
        default=lambda:
            datetime.utcnow().date()
    )

    eleve = db.relationship(
        "Eleve",
        backref=db.backref(
            "evaluations_competences",
            cascade="all, delete-orphan"
        )
    )

    activite = db.relationship(
        "Activite",
        backref="evaluations_competences"
    )

    def to_dict(self):

        niveaux = {
            0: "Non acquis",
            1: "En cours d'acquisition",
            2: "Partiellement acquis",
            3: "Acquis",
        }

        return {
            "id": self.id,

            "eleve_id":
                self.eleve_id,

            "eleve_nom":
                self.eleve.nom
                if self.eleve
                else None,

            "eleve_prenom":
                self.eleve.prenom
                if self.eleve
                else None,

            "competence_id":
                self.competence_id,

            "competence_code":
                self.competence.code
                if self.competence
                else None,

            "competence_nom":
                self.competence.nom
                if self.competence
                else None,

            "activite_id":
                self.activite_id,

            "activite_titre":
                self.activite.titre
                if self.activite
                else None,

            "niveau":
                self.niveau,

            "niveau_label":
                niveaux.get(
                    self.niveau,
                    "Inconnu"
                ),

            "commentaire":
                self.commentaire,

            "appreciation_id": self.appreciation_id,

            "appreciation": self.appreciation.libelle if self.appreciation else None,

            "date":
                self.date.isoformat()
                if self.date
                else None,
        }


class EvaluationActivite(db.Model):
    __tablename__ = "evaluations_activites"
    __table_args__ = (db.UniqueConstraint("eleve_id", "activite_id", name="uq_evaluation_activite_eleve"),)

    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey("eleves.id"), nullable=False)
    activite_id = db.Column(db.Integer, db.ForeignKey("activites.id"), nullable=False)
    note = db.Column(db.Float, nullable=False)
    bareme = db.Column(db.Float, default=20, nullable=False)
    date = db.Column(db.Date, default=lambda: datetime.utcnow().date())

    eleve = db.relationship("Eleve", backref=db.backref("evaluations_activites", cascade="all, delete-orphan"))
    activite = db.relationship("Activite", backref="evaluations_activites")

    def to_dict(self):
        return {
            "id": self.id,
            "eleve_id": self.eleve_id,
            "activite_id": self.activite_id,
            "note": self.note,
            "bareme": self.bareme,
            "date": self.date.isoformat() if self.date else None,
        }


class Appreciation(db.Model):
    __tablename__ = "appreciations"

    id = db.Column(db.Integer, primary_key=True)
    libelle = db.Column(db.String(255), nullable=False)
    filiere = db.Column(db.String(120), default="CIEL", nullable=False)
    actif = db.Column(db.Boolean, default=True, nullable=False)

    evaluations = db.relationship("EvaluationCompetence", backref="appreciation")

