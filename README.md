🧠 AI Doc Manager
AI Doc Manager est une application de bureau intelligente permettant de stocker, gérer et rechercher sémantiquement dans des documents locaux (PDF, DOCX, TXT).

Contrairement à une recherche classique par mots-clés, cette application utilise l'Intelligence Artificielle (Embeddings + Vector Search) pour comprendre le sens de votre question.

🏗️ Architecture du Projet
Ce projet a évolué vers une architecture optimisée en 2 parties :

Application Electron (TypeScript/React/Node.js) :

Frontend : Interface utilisateur en React.

Backend (Main Process) : Gère la logique métier, la base de données (MySQL + Prisma) et les fichiers locaux.

Microservice IA (Python) :

API Flask légère.

Gère uniquement la vectorisation (Embeddings) et l'indexation FAISS.

🛠️ 1. Prérequis
Avant de commencer, assurez-vous d'avoir installé ces logiciels sur votre machine :

Node.js (v18 ou supérieur) : nodejs.org

Python (v3.10 ou supérieur) : python.org

MySQL Server : dev.mysql.com

Git : git-scm.com

🚀 2. Installation & Configuration
Clonez ce dépôt sur votre machine. Vous aurez deux dossiers principaux (par exemple python_service et electron_app).

Étape A : Préparer la Base de Données

Ouvrez votre client MySQL (Workbench, DBeaver ou ligne de commande).

Créez une base de données vide :

```SQL
CREATE DATABASE ai_doc_manager;
```

(Les tables seront créées automatiquement par Prisma plus tard).

Étape B : Installer le Service IA (Python)

Ouvrez un terminal et allez dans le dossier du service Python (ex: AI_api) :

```Bash
cd AI_api
```

Créez et activez un environnement virtuel :

```Bash
# Windows
python -m venv ai_env
.\ai_env\Scripts\activate

# Mac/Linux
python3 -m venv ai_env
source ai_env/bin/activate
````

Installez les dépendances :

```Bash
pip install -r requirements.txt
```

Configuration : Créez un fichier .env ou config.py (selon votre code) pour définir les dossiers de stockage :

```Python
# Exemple de config nécessaire
UPLOAD_FOLDER = '../client_electron/uploaded_docs'  # Doit pointer vers le dossier de stockage d'Electron
FAISS_INDEX_DIR = 'faiss_indices'
```

Étape C : Installer l'Application Electron (Main + Renderer)

Ouvrez un nouveau terminal et allez dans le dossier de l'application :

```Bash
cd client_electron
```

Installez les dépendances :

```Bash
npm install
```

Configuration (Critique) : Créez un fichier .env à la racine de client_electron :

```Extrait de code
# Connexion BDD
DATABASE_URL="mysql://USER:MOT_DE_PASSE@127.0.0.1:3306/ai_doc_manager"
```

Initialisez la base de données avec Prisma :

```Bash
# Génère le client Prisma et pousse le schéma vers la DB
npx prisma generate
npx prisma db push
```

▶️ 3. Lancer l'Application
Vous devez avoir 2 terminaux ouverts en parallèle.

Terminal 1 : Le Moteur IA (Python)

```Bash
cd AI_api
# Assurez-vous que l'env est activé (source ai_env/bin/activate)
python run.py
```

Le service doit indiquer qu'il tourne sur le port 5001.

Terminal 2 : L'Application Electron

```Bash
cd client_electron
npm run dev
```

Une fenêtre devrait s'ouvrir. C'est prêt !
