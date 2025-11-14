import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.models.database import DatabaseRepository
from app.core.file_loaders import LoaderFactory
from app.services.vector_store import VectorStore

class SemanticSearchService:
    def __init__(self, 
                 db_repo: DatabaseRepository, 
                 loader_factory: LoaderFactory,
                 vector_store: VectorStore,
                 model: SentenceTransformer): 
        
        self.db = db_repo
        self.loader_factory = loader_factory
        self.vector_store = vector_store
        self.model = model 
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200, 
            length_function=len
        )
        
        self.faiss_to_chunk_map = {} 

    def _ensure_mappings_loaded(self, user_id: int):
        if user_id not in self.faiss_to_chunk_map:
            f_to_c, _ = self.db.get_mappings_for_user(user_id)
            self.faiss_to_chunk_map[user_id] = f_to_c

    def process_and_index_document(self, user_id: int, document_id: int, file_path: str) -> dict:
        print(f"Indexation doc {document_id}...")

        loader = self.loader_factory.get_loader(file_path)
        full_text, metadata = loader.load(file_path)
        
        if not full_text:
            return {"status": "error", "message": "Document vide ou illisible"}

        for key, value in metadata.items():
            self.db.insert_metadata(document_id, key, value)

        chunks = self.text_splitter.split_text(full_text)
        print(f"Document découpé en {len(chunks)} chunks.")

        embeddings = self.model.encode(chunks, show_progress_bar=True)
        embeddings = np.asarray(embeddings, dtype=np.float32)

        faiss_ids = self.vector_store.add_vectors(user_id, embeddings)

        self._ensure_mappings_loaded(user_id)
        
        for i, (chunk_text, faiss_id) in enumerate(zip(chunks, faiss_ids)):
            chunk_id = self.db.create_chunk(document_id, i, chunk_text)
            self.db.create_faiss_mapping(user_id, faiss_id, chunk_id)
            self.faiss_to_chunk_map[user_id][faiss_id] = chunk_id

        self.vector_store.save_index(user_id)
        
        return {"status": "success", "chunks_indexed": len(chunks)}

    def search(self, user_id: int, query: str, k: int = 5) -> list:
        self._ensure_mappings_loaded(user_id)

        try:
            search_id = self.db.insert_search_entry(user_id, query)
        except Exception as e:
            print(f"Erreur lors de l'enregistrement de la recherche : {e}")
            search_id = None
        
        query_emb = self.model.encode([query])
        query_emb = np.asarray(query_emb, dtype=np.float32)

        distances, faiss_indices = self.vector_store.search(user_id, query_emb, k)
        
        if len(faiss_indices) == 0: 
            return []

        chunk_ids = []
        scores = {}
        DISTANCE_THRESHOLD = 1.2 
        
        for i, faiss_idx in enumerate(faiss_indices):
            score = float(distances[i])
            
            if score > DISTANCE_THRESHOLD or faiss_idx == -1: 
                continue
            
            chunk_id = self.faiss_to_chunk_map[user_id].get(faiss_idx)
            if chunk_id:
                chunk_ids.append(chunk_id)
                scores[chunk_id] = score

        results = self.db.get_chunks_by_ids(chunk_ids)
        
        final_results = []
        for i,res in enumerate(results):
            res_score = scores.get(res['chunk_id'])
            res["score"] = res_score
            final_results.append(res)
            
            if search_id is not None:
                try:
                    self.db.insert_search_result(
                        search_id=search_id,
                        chunk_id=res['chunk_id'],
                        score=res_score,
                        rank_pos=i + 1 
                    )
                except Exception as e:
                    print(f"Erreur lors de l'enregistrement du résultat de recherche : {e}")
        return final_results