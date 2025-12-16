import numpy as np
import faiss 
from sentence_transformers import SentenceTransformer
from app.models.faiss_repo import FaissRepository
from app.services.vector_store import VectorStore

class SemanticSearchService:
    def __init__(self, 
                 faiss_repo: FaissRepository,
                 vector_store: VectorStore,
                 model: SentenceTransformer): 
        
        self.faiss_repo = faiss_repo
        self.vector_store = vector_store
        self.model = model 
        
        self.faiss_to_chunk_map = {}
    
    def vectorize_chunks(self, user_id: int, chunks_with_ids: list) -> dict:
        """
        Reçoit une liste de { 'id': int, 'text': str }
        Calcule les vecteurs et met à jour FAISS.
        """
        print(f"Vectorisation de {len(chunks_with_ids)} chunks pour user {user_id}")

        texts = [item['text'] for item in chunks_with_ids]
        chunk_db_ids = [item['id'] for item in chunks_with_ids]

        embeddings = self.model.encode(texts, show_progress_bar=True)
        faiss.normalize_L2(embeddings)

       
        faiss_ids = self.vector_store.add_vectors(user_id, embeddings)

        self._ensure_mappings_loaded(user_id)
        
        for db_id, faiss_id in zip(chunk_db_ids, faiss_ids):
            self.faiss_repo.create_faiss_mapping(user_id, faiss_id, db_id)
            self.faiss_to_chunk_map[user_id][faiss_id] = db_id

        self.vector_store.save_index(user_id)
        
        return {"status": "success", "chunks_indexed": len(texts)}

    def _ensure_mappings_loaded(self, user_id: int):
        if user_id not in self.faiss_to_chunk_map:
            f_to_c, _ = self.faiss_repo.get_mappings_for_user(user_id)
            self.faiss_to_chunk_map[user_id] = f_to_c


    def search(self, user_id: int, query: str, k: int = 5) -> list:
        self._ensure_mappings_loaded(user_id)
        
        query_emb = self.model.encode([query])
        
        faiss.normalize_L2(query_emb)

        distances, faiss_indices = self.vector_store.search(user_id, query_emb, k)
        
        if len(faiss_indices) == 0: 
            return []

        results = []
        SIMILARITY_THRESHOLD = 0.30 
        
        for i, faiss_idx in enumerate(faiss_indices):
            score = float(distances[i])
            
            if score < SIMILARITY_THRESHOLD or faiss_idx == -1: 
                continue
            
            chunk_id = self.faiss_to_chunk_map[user_id].get(faiss_idx)
            if chunk_id:
                results.append({
                    "chunk_id": chunk_id,
                    "score": score
                })
        return results