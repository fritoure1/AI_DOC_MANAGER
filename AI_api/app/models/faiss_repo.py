from sqlalchemy import text
from app.models.base import BaseRepository

class FaissRepository(BaseRepository):
    def create_faiss_mapping(self, user_id: int, faiss_index_id: int, chunk_id: int):
        with self.engine.connect() as conn:
            conn.execute(
                text("""INSERT INTO FAISS_MAP (user_id, faiss_index_id, chunk_id)
                        VALUES (:uid, :fid, :cid)"""),
                {"uid": user_id, "fid": faiss_index_id, "cid": chunk_id}
            )
            conn.commit()

    def get_mappings_for_user(self, user_id: int):
        faiss_to_chunk = {}
        chunk_to_faiss = {}
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT faiss_index_id, chunk_id FROM FAISS_MAP WHERE user_id = :uid"),
                {"uid": user_id}
            )
            for row in result:
                faiss_to_chunk[row[0]] = row[1]
                chunk_to_faiss[row[1]] = row[0]
        return faiss_to_chunk, chunk_to_faiss