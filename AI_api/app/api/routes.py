from flask import Blueprint, request, jsonify
from app.core.extension import nlp_service

bp = Blueprint('api', __name__, url_prefix='/')

@bp.route('/vectorize', methods=['POST'])
def vectorize_endpoint():
    data = request.get_json()
    
    user_id = data.get('user_id')
    chunks = data.get('chunks') # Liste de dicts {id, text}
    
    if not user_id or not chunks:
        return jsonify({"error": "Données manquantes"}), 400

    try:
        # Appel au service
        result = nlp_service.vectorize_chunks(int(user_id), chunks)
        return jsonify(result), 200

    except Exception as e:
        print(f"Erreur vectorize: {e}")
        return jsonify({"error": str(e)}), 500

# --- 2. ROUTE DE RECHERCHE (INCHANGÉE) ---
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
        print(f"Erreur API search: {e}")
        return jsonify({"error": str(e)}), 500