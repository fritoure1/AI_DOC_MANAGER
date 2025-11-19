from sqlalchemy import create_engine
from app.config import DATABASE_URI

class BaseRepository:
    def __init__(self, uri: str = DATABASE_URI):
        self.engine = create_engine(uri)