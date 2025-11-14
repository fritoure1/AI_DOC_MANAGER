import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.core.extension import nlp_service, db_repo
from app.config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER

bp = Blueprint('api', __name__, url_prefix='/')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
def upload_document():

    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier fourni"}), 400
    if 'user_id' not in request.form:
        return jsonify({"error": "user_id manquant"}), 400
    
    file = request.files['file']
    try:
        user_id = int(request.form['user_id'])
    except ValueError:
        return jsonify({"error": "user_id doit être un entier"}), 400

    if file.filename == '':
        return jsonify({"error": "Nom de fichier vide"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        existing_doc = db_repo.get_document_by_name(user_id, filename)
        if existing_doc:
            print(f"Conflit : Le fichier '{filename}' existe déjà pour l'utilisateur {user_id}.")
            return jsonify({
                "status": "error",
                "message": f"Un fichier nommé '{filename}' existe déjà (ID: {existing_doc['id']})."
            }), 409

        user_upload_dir = os.path.join(UPLOAD_FOLDER, str(user_id))
        os.makedirs(user_upload_dir, exist_ok=True)
        
        file_path = os.path.join(user_upload_dir, filename)
        file.save(file_path)
        print(f"Fichier sauvegardé : {file_path}")

        doc_type = filename.rsplit('.', 1)[1].lower()

        try:
            document_id = db_repo.insert_doc(
                user_id=user_id,
                file_name=filename,
                file_path=file_path,
                doc_type=doc_type
            )
            
            result = nlp_service.process_and_index_document(
                user_id=user_id,
                document_id=document_id,
                file_path=file_path
            )

            if result.get("status") == "error":
                return jsonify(result), 400
            
            return jsonify(result), 201

        except Exception as e:
            print(f"Erreur upload: {e}")
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Fichier non autorisé"}), 400

@bp.route('/search', methods=['GET'])
def search_documents():
    query = request.args.get('q')
    user_id_str = request.args.get('user_id')

    if not query or not user_id_str:
        return jsonify({"error": "Paramètres 'q' et 'user_id' requis"}), 400

    try:
        user_id = int(user_id_str)
        results = nlp_service.search(user_id, query, k=10)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500