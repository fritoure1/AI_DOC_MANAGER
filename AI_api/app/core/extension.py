from sentence_transformers import SentenceTransformer
from app.models.database import DatabaseRepository
from app.core.file_loaders import LoaderFactory
from app.services.vector_store import VectorStore
from app.services.nlp_service import SemanticSearchService
from app.config import MODEL_NAME

db_repo = DatabaseRepository()
loader_factory = LoaderFactory()

print(f"Chargement du modèle {MODEL_NAME}...")
model_instance = SentenceTransformer(MODEL_NAME)

dimension = model_instance.get_sentence_embedding_dimension()
print(f"Modèle chargé. Dimension des vecteurs : {dimension}")

vector_store = VectorStore(dimension)

nlp_service = SemanticSearchService(
    db_repo=db_repo,
    loader_factory=loader_factory,
    vector_store=vector_store,
    model=model_instance
)

print("Service NLP initialisé et prêt.")