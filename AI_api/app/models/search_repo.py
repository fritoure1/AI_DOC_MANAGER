from sqlalchemy import text
from app.models.base import BaseRepository

class SearchRepository(BaseRepository):
    def insert_search_entry(self, user_id: int, query_text: str)-> int:

        with self.engine.connect() as conn:
            result = conn.execute(
                text(""" INSERT INTO SEARCHES (user_id, query_text)
                    VALUES(:uid, :query)"""),
                    {"uid": user_id, "query": query_text}
            )
            conn.commit()
            return result.lastrowid

    def insert_search_result(self, search_id: int, chunk_id: int, score: float, rank_pos: int):
            with self.engine.connect() as conn:
                conn.execute(
                    text("""INSERT INTO SEARCH_RESULTS (search_id, chunk_id, score, rank_pos)
                            VALUES (:sid, :cid, :score, :rank)"""),
                    {"sid": search_id, "cid": chunk_id, "score": score, "rank": rank_pos}
                )
                conn.commit()