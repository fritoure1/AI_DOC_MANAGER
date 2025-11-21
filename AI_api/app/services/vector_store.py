import faiss
import os
import numpy as np
from app.config import FAISS_INDEX_DIR

class VectorStore:
    def __init__(self, dimension: int):
        self.dimension = dimension
        self.indices: dict[int, faiss.Index] = {}
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)

    def _get_path(self, user_id: int) -> str:
        return os.path.join(FAISS_INDEX_DIR, f"user_{user_id}.faiss")

    def load_index(self, user_id: int) -> faiss.Index:
        if user_id in self.indices:
            return self.indices[user_id]
        
        path = self._get_path(user_id)
        if os.path.exists(path):
            print(f"Chargement index FAISS user {user_id}")
            index = faiss.read_index(path)
        else:
            print(f"Nouvel index FAISS user {user_id}")
            index = faiss.IndexFlatIP(self.dimension)
        
        self.indices[user_id] = index
        return index

    def save_index(self, user_id: int):
        if user_id in self.indices:
            faiss.write_index(self.indices[user_id], self._get_path(user_id))

    def add_vectors(self, user_id: int, vectors: np.ndarray) -> list[int]:
        index = self.load_index(user_id)
        start_id = index.ntotal
        index.add(vectors)
        return list(range(start_id, start_id + len(vectors)))

    def search(self, user_id: int, query_vector: np.ndarray, k: int = 5):
        index = self.load_index(user_id)
        if index.ntotal == 0:
            return [], []
        distances, indices = index.search(query_vector, k)
        return distances[0], indices[0]