from abc import ABC, abstractmethod
import fitz
from docx import Document
import os

class DocumentLoader(ABC):
    @abstractmethod
    def load(self, file_path: str) -> str:
        pass

class PdfLoader(DocumentLoader):
    def load(self, file_path:str)-> str:
        text=""
        metadata = {}
        try:
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text() +"\n"
                
                meta_raw = doc.metadata
                metadata = {
                    "title": meta_raw.get("title", ""),
                    "author": meta_raw.get("author", ""),
                    "subject": meta_raw.get("subject", ""),
                    "creator": meta_raw.get("creator", ""),
                    "page_count": doc.page_count,
                    "file_format": "pdf"
                }

        except Exception as e:
            print(f"Erreur PDF lors de la lecture de {file_path}: {e}")
            return "", {}
        return text, metadata

class DocxLoader(DocumentLoader):
    def load(self, file_path:str)-> str:
        text=""
        metadata = {}
        try:
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
            
            core_props = doc.core_properties
            metadata = {
                "author": core_props.author or "",
                "title": core_props.title or "",
                "created": str(core_props.created) if core_props.created else "",
                "file_format": "docx"
            }

        except Exception as e:
            print(f"Erreur python-docx lors de la lecture de {file_path}: {e}")
            return "", {}
        return text, metadata

class TxtLoader(DocumentLoader):
    def load(self, file_path:str)-> str:
        text = ""
        metadata = {}
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
            stats = os.stat(file_path)
            metadata = {
                "file_size_bytes": stats.st_size,
                "file_format": "txt"
            }

        except Exception as e:
            print(f"Erreur lecture TXT de {file_path}: {e}")
            return "", {}
        return text, metadata

class LoaderFactory:
    def __init__(self):
        self._loaders = {
            '.pdf': PdfLoader(),
            '.docx': DocxLoader(),
            '.txt': TxtLoader(),
            '.md': TxtLoader()
        }

    def get_loader(self, file_path: str) -> DocumentLoader:
        _, ext = os.path.splitext(file_path)
        loader = self._loaders.get(ext.lower())
        if not loader:
            print(f"Format {ext} non supporté, tentative TXT.")
            return self._loaders['.txt']
        return loader