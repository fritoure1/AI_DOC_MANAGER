# 🧠 AI Doc Manager

**AI Doc Manager** est une application de bureau "Intelligente" permettant de stocker, gérer et rechercher sémantiquement dans des documents locaux (PDF, DOCX, TXT).

Contrairement à une recherche classique par mots-clés, cette application utilise l'Intelligence Artificielle (Embeddings + Vector Search) pour comprendre le **sens** de votre question.

---

## 🏗️ Architecture du Projet

Ce projet utilise une architecture **Microservices** distribuée en 3 parties distinctes :

1.  **`AI_api` (Python)** : Le cerveau. Gère l'IA, FAISS (index vectoriel) et la lecture des fichiers.
2.  **`Node_api` (Node.js)** : La passerelle. Gère l'authentification (JWT), la BDD (MySQL/Prisma) et fait le lien entre le client et l'IA.
3.  **`client_electron` (React/Electron)** : L'interface utilisateur moderne (Chakra UI).

---

## 🛠️ 1. Prérequis

Avant de commencer, assurez-vous d'avoir installé ces logiciels sur votre machine :

* **Node.js** (v18 ou supérieur) :(https://nodejs.org/)
* **Python** (v3.10 ou supérieur) : (https://www.python.org/)
* **MySQL Server** : (https://dev.mysql.com/downloads/installer/)
* **Git** : (https://git-scm.com/)

---

## 🚀 2. Installation & Configuration

Clonez ce dépôt sur votre machine, puis ouvrez un terminal à la racine du projet.

### Étape A : Préparer la Base de Données
1.  Ouvrez votre client MySQL (Workbench, DBeaver ou ligne de commande).
2.  Créez une base de données vide :
    ```sql
    CREATE DATABASE ai_doc_manager;
    ```

### Étape B : Installer le Service IA (Python)

1.  Ouvrez un terminal et allez dans le dossier :
    ```bash
    cd AI_api
    ```
2.  Créez un environnement virtuel :
    ```bash
    # Sur Windows
    python -m venv ai_env
    # Sur Mac/Linux
    python3 -m venv ai_env
    ```
3.  Activez l'environnement :
    ```bash
    # Sur Windows
    .\ai_env\Scripts\activate
    # Sur Mac/Linux
    source ai_env/bin/activate
    ```
4.  Installez les dépendances :
    ```bash
    pip install -r app/requirements.txt
    ```
    *(Cela peut prendre quelques minutes car il télécharge les modèles d'IA).*

5.  **IMPORTANT : Configuration**
    Créez un fichier nommé `config.py` dans le dossier `app` (chemin : `AI_api/app/config.py`) et collez-y le code suivant :

    ```python
    import os

    DB_USER = "root"# Mettez le même USER que lors de l'installation MySQL
    DB_PASS = ""  # Mettez le même mot de passe que lors de l'installation MySQL
    DB_HOST = "127.0.0.1"
    DB_PORT = 3306
    DB_NAME = "ai_doc_manager"

    DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    # Configuration IA & Fichiers
    MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
    FAISS_INDEX_DIR = "faiss_indices"
    UPLOAD_FOLDER = 'uploaded_docs'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'md'}

    # Création automatique des dossiers nécessaires
    os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    ```

### Étape C : Installer l'API Node.js (Backend)

1.  Ouvrez un **nouveau terminal** et allez dans le dossier :
    ```bash
    cd Node_api
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  **IMPORTANT : Configuration**
    Créez un fichier `.env` à l'intérieur du dossier `Node_api` et collez-y ceci :
    ```env
    # Adaptez avec votre mot de passe MySQL
    DATABASE_URL="mysql://USER:MOT_DE_PASSE@127.0.0.1:3306/ai_doc_manager"
    
    # Mettez une phrase longue et aléatoire ici
    JWT_SECRET="votre_secret_super_securise_et_long_pour_jwt_12345"
    ```
4.  Initialisez la base de données avec Prisma :
    ```bash
    # Cela va créer les tables dans MySQL
    npx prisma db push

    # Cela va générer le client Prisma
    npx prisma generate
    ```

### Étape D : Installer le Client (Electron)

1.  Ouvrez un **nouveau terminal** et allez dans le dossier :
    ```bash
    cd client_electron
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```

---

## ▶️ 3. Lancer l'Application

Vous devez avoir **3 terminaux ouverts** en parallèle.

**Terminal 1 : Service IA**
```bash
cd AI_api
# (Activez l'env si besoin: source ai_env/bin/activate)
python run.py
```

**Terminal 2 : API Node.js**
```bash
cd Node_api
npm run dev
```

**Terminal 1 : Service IA**
```bash
cd client_electron
npm run dev
```