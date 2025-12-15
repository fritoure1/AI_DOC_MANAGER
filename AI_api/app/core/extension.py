from sentence_transformers import SentenceTransformer
from app.models.faiss_repo import FaissRepository
from app.services.vector_store import VectorStore
from app.services.nlp_service import SemanticSearchService
from app.config import MODEL_NAME

faiss_repo = FaissRepository()

print(f"Chargement du modèle {MODEL_NAME}...")
model_instance = SentenceTransformer(MODEL_NAME)

dimension = model_instance.get_sentence_embedding_dimension()
print(f"Modèle chargé. Dimension des vecteurs : {dimension}")

vector_store = VectorStore(dimension)

nlp_service = SemanticSearchService(
    faiss_repo=faiss_repo,
    vector_store=vector_store,
    model=model_instance
)

print("Service NLP initialisé et prêt.")