from sentence_transformers import SentenceTransformer

from app.models.document_repo import DocumentRepository
from app.models.search_repo import SearchRepository
from app.models.faiss_repo import FaissRepository

from app.core.file_loaders import LoaderFactory
from app.services.vector_store import VectorStore
from app.services.nlp_service import SemanticSearchService
from app.config import MODEL_NAME

doc_repo = DocumentRepository()
search_repo = SearchRepository()
faiss_repo = FaissRepository()
loader_factory = LoaderFactory()

print(f"Chargement du modèle {MODEL_NAME}...")
model_instance = SentenceTransformer(MODEL_NAME)

dimension = model_instance.get_sentence_embedding_dimension()
print(f"Modèle chargé. Dimension des vecteurs : {dimension}")

vector_store = VectorStore(dimension)

nlp_service = SemanticSearchService(
    doc_repo=doc_repo,
    search_repo=search_repo,
    faiss_repo=faiss_repo,
    loader_factory=loader_factory,
    vector_store=vector_store,
    model=model_instance
)

print("Service NLP initialisé et prêt.")