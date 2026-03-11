"""
SentenceTransformer embedding model wrapper
"""
from sentence_transformers import SentenceTransformer
import logging
from app.config import config

logger = logging.getLogger(__name__)

class EmbeddingModel:
    """Wrapper for SentenceTransformer model"""
    
    def __init__(self):
        self.model = None
        self.model_name = config.SENTENCE_TRANSFORMER_MODEL
        self._load_model()
    
    def _load_model(self):
        """Load SentenceTransformer model"""
        try:
            logger.info(f"Loading SentenceTransformer model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("✅ SentenceTransformer model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load SentenceTransformer model: {e}")
            raise
    
    def encode(self, texts):
        """
        Generate embeddings for texts
        
        Args:
            texts: String or list of strings
            
        Returns:
            numpy array of embeddings
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        if isinstance(texts, str):
            texts = [texts]
        
        return self.model.encode(texts, convert_to_numpy=True)
    
    def get_embedding_dimension(self):
        """Get embedding dimension"""
        if self.model is None:
            return None
        return self.model.get_sentence_embedding_dimension()
