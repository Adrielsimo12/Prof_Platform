# Plateforme pédagogique — Prof Platform

Application de gestion de cours, classes, élèves, activités, compétences et évaluations, utilisable sur le PC serveur et à distance depuis un téléphone ou un autre ordinateur.

- Frontend : React + Vite
- Backend : Python + Flask
- Base de données : MySQL 8
- Accès réseau : frontend sur le port 5173 et API sur le port 5000
- Déploiement Ubuntu détaillé : `DEPLOIEMENT_UBUNTU.txt`

---

## 1. Structure du projet

```text
prof-platform/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── requirements.txt
│   ├── seed.py
│   ├── routes/
│   ├── storage/
│   └── venv/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── styles/
│
├── README.md
├── start.bat
├── start.ps1
└── .gitignore
```

---

## 2. Prérequis

Installez au préalable :

- Python 3.10+
- Node.js 18+
- MySQL 8+

Vérification rapide :

```bash
python --version
node --version
npm --version
mysql --version
```

---

## 3. Créer la base MySQL

Dans MySQL :

```sql
CREATE DATABASE prof_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Si vous utilisez un fichier de configuration, renseignez les identifiants dans `backend/.env` ou dans les variables d’environnement. Par défaut, le projet essaie de se connecter à MySQL localement avec :

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prof_platform
DB_USER=root
DB_PASSWORD=
```

---

## 4. Installer le backend

Ouvrez un terminal dans le dossier `backend/` :

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Sur Linux/macOS :

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 5. Démarrage du projet

### 5.1 Lancer le backend

Depuis le dossier `backend/` :

```bash
venv\Scripts\activate
python app.py
```

Ou sur Linux/macOS :

```bash
source venv/bin/activate
python app.py
```

Le backend démarre sur :

```text
http://localhost:5000
```

Le démarrage automatique crée les tables si elles n’existent pas et initialise le compte enseignant par défaut.

### 5.2 Lancer le frontend

Dans un nouveau terminal, depuis le dossier `frontend/` :

```bash
cd frontend
npm install
npm run dev
```

Le frontend est ensuite accessible sur :

```text
http://localhost:5173
```

---

## 6. Identifiants par défaut

Le projet contient un compte enseignant de base :

- Nom d’utilisateur : `enseignant`
- Mot de passe : `enseignant`

Pour les comptes supplémentaires, utilisez la page “Enseignants” dans l’application.

---

## 7. Initialisation des données

Au premier lancement, le backend initialise automatiquement :

- les tables SQLAlchemy
- le compte enseignant par défaut
- les domaines et compétences CIEL
- les classes et catégories de base, si nécessaire

Si vous voulez relancer une initialisation manuelle :

```bash
cd backend
venv\Scripts\activate
python seed.py
```

---

## 8. Scripts de lancement rapide

### Windows PowerShell

Depuis la racine du projet :

```powershell
./start.ps1
```

### Windows CMD

```bat
start.bat
```

Un double-clic sur `start.bat` lance silencieusement le backend et le frontend en arrière-plan, puis ouvre automatiquement le navigateur sur `http://localhost:5173`. Aucune fenêtre de commande ne doit rester ouverte.

Le fichier `start-hidden.vbs` est le lanceur invisible utilisé par `start.bat`.

---

## 9. Fonctionnalités principales

- gestion des classes, chacune rattachée à une filière (CIEL, MELEC ou une filière libre)
- gestion des élèves
- gestion des cours, organisés en catégories/groupes propres à chaque enseignant et à chaque filière
- gestion des activités pédagogiques, avec des compétences proposées selon la filière de la classe
- gestion des compétences par filière avec import et export CSV, suppression d'une compétence ou d'un groupe entier
- évaluations par classe / élève / activité / compétence
- appréciations par élève et groupe de classe, adaptées à la filière de la classe
- suivi de progression
- planning
- import CSV des élèves et du planning depuis un appareil distant
- ressources PDF, documents et images accessibles à distance
- messagerie privée avec pièces jointes
- comptes enseignant avec validation email et approbation admin
- rôles enseignant et administrateur

---

## 10. Points de dépannage

### Le backend ne démarre pas

Vérifiez :

- que MySQL est bien démarré
- que la base `prof_platform` existe
- que les identifiants DB sont corrects
- que le venv a bien les dépendances installées

### Le frontend est vide

Vérifiez :

- que le backend tourne sur `http://localhost:5000`
- que l’API répond sur `/api/health`
- que la page de connexion est bien ouverte

### Les compétences ne s’affichent pas

Vérifiez que l’API répond bien sur :

```text
http://localhost:5000/api/domaines-competences
```

---

## 11. Données de référence

Le référentiel CIEL intégré contient les compétences suivantes :

- C01 — COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)
- C02 — ORGANISER
- C03 — PARTICIPER A UN PROJET
- C04 — ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE
- C05 — CONCEVOIR
- C06 — VALIDER LA CONFORMITÉ D'UNE INSTALLATION
- C07 — RÉALISER DES MAQUETTES ET PROTOTYPES
- C08 — CODER
- C09 — INSTALLER LES ÉLÉMENTS D'UN SYSTÈME ÉLECTRONIQUE OU INFORMATIQUE
- C10 — EXPLOITER UN RÉSEAU INFORMATIQUE
- C11 — MAINTENIR UN SYSTÈME ÉLECTRONIQUE OU RÉSEAU INFORMATIQUE

---

## 12. Commandes rapides

### Backend

```bash
cd backend
venv\Scripts\activate
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Vérification de l’état de l’API

```bash
curl http://localhost:5000/api/health
```

---

## 13. Accès distant et imports

Depuis un téléphone ou un autre PC du même réseau, ouvrir :

```text
http://ADRESSE_IP_DU_SERVEUR:5173
```

Les imports CSV et les fichiers envoyés par la messagerie ou les ressources de cours sont transmis au backend par l'API. Les téléchargements utilisent également l'API authentifiée : il ne faut pas remplacer l'adresse du serveur par `localhost` sur le téléphone.

Autoriser les ports 5173 et 5000 dans le pare-feu Windows. Pour un accès depuis Internet, utiliser un VPN ou un reverse proxy HTTPS plutôt qu'une ouverture directe non sécurisée.

## 14. Comptes, rôles et messagerie

Les comptes peuvent être créés avec une adresse email et une filière. Après validation de l'email, un administrateur doit approuver le compte. Les comptes `Adriel` et `enseignant` sont administrateurs.

Seuls les administrateurs peuvent créer, approuver, modifier ou supprimer des comptes. L'onglet Messagerie permet d'échanger des messages et des pièces jointes entre utilisateurs approuvés.

## 15. Filières, compétences et catégories de cours

Chaque classe possède désormais sa propre filière (CIEL, MELEC ou une filière libre créée à la volée). Elle se choisit à la création de la classe et peut être modifiée à tout moment depuis la fiche de la classe.

Les compétences proposées dans les activités, les évaluations et les appréciations dépendent de la filière de la classe sélectionnée, pas seulement de la filière par défaut du compte enseignant. Cela permet à un même enseignant de gérer des classes de filières différentes sans mélanger les référentiels.

Sur la page Compétences :

- un sélecteur permet de consulter ou d'importer le référentiel d'une filière précise, indépendamment de la filière du compte ;
- un bouton « Exporter CSV » télécharge l'ensemble du référentiel, toutes filières confondues ;
- chaque compétence peut être supprimée individuellement ;
- un groupe de compétences (domaine) peut être supprimé entièrement, avec toutes les compétences qu'il contient.

Sur la page Cours, un enseignant peut créer ses propres catégories/groupes de cours, rattachées à une filière. Ces catégories ne sont visibles que par leur créateur : un nouvel enseignant démarre avec une liste vide et construit sa propre organisation. Une catégorie peut être supprimée tant qu'aucun cours ne l'utilise encore.

## 16. Remarques

Le premier lancement crée automatiquement la structure de base et les éléments essentiels pour travailler immédiatement. Si le navigateur s'ouvre avant la fin du démarrage, attendre quelques secondes puis actualiser la page.
