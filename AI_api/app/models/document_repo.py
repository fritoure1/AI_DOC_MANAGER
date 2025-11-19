from sqlalchemy import text
from app.models.base import BaseRepository

class DocumentRepository(BaseRepository):
    def get_document_by_name(self, user_id: int, file_name: str) -> dict | None:
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, file_path FROM DOCUMENTS WHERE user_id = :uid AND file_name = :fn"),
                {"uid": user_id, "fn": file_name}
            )
            row = result.fetchone()
            return row._asdict() if row else None

    def insert_doc(self, user_id: int, file_name: str, file_path: str, doc_type: str) -> int:
        with self.engine.connect() as conn:
            result = conn.execute(
                text("""INSERT INTO DOCUMENTS (user_id, file_name, file_path, doc_type)
                        VALUES (:uid, :fn, :fp, :dt)"""),
                {"uid": user_id, "fn": file_name, "fp": file_path, "dt": doc_type}
            )
            conn.commit()
            return result.lastrowid
    def insert_metadata(self, document_id: int, key: str, value: str):
        if not value: 
            return

        val_str = str(value)

        with self.engine.connect() as conn:
            conn.execute(
                text("""
                INSERT INTO DOCUMENT_METADATA (document_id, meta_key, meta_value)
                VALUES (:did, :key, :val)
                ON DUPLICATE KEY UPDATE meta_value = :val
                """),
                {"did": document_id, "key": key, "val": val_str}
            )
            conn.commit()
    
    def create_chunk(self, document_id: int, chunk_index: int, content: str) -> int:
        with self.engine.connect() as conn:
            result = conn.execute(
                text("""INSERT INTO DOCUMENT_CHUNKS (document_id, chunk_index, content)
                        VALUES (:did, :idx, :content)"""),
                {"did": document_id, "idx": chunk_index, "content": content}
            )
            conn.commit()
            return result.lastrowid

    def get_chunks_by_ids(self, chunk_ids: list[int]) -> list[dict]:
        if not chunk_ids: return []
        placeholders = ', '.join([':id_' + str(i) for i in range(len(chunk_ids))])
        params = {'id_' + str(i): c for i, c in enumerate(chunk_ids)}
        
        query = text(f"""SELECT c.id as chunk_id, c.content, d.file_name, d.id as document_id
                         FROM DOCUMENT_CHUNKS c JOIN DOCUMENTS d ON c.document_id = d.id
                         WHERE c.id IN ({placeholders})""")
        
        results = []
        with self.engine.connect() as conn:
            for row in conn.execute(query, params).mappings():
                results.append(dict(row))
        return sorted(results, key=lambda r: chunk_ids.index(r['chunk_id']))