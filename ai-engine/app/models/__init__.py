"""
ML Models loader and manager
"""
from .embeddings import EmbeddingModel

# Initialize models on import
embedding_model = EmbeddingModel()

__all__ = ['embedding_model']
