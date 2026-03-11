"""
Similarity calculation using sentence embeddings
"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.models import embedding_model
import logging

logger = logging.getLogger(__name__)

def calculate_similarity(resume_text: str, job_description: str) -> dict:
    """
    Calculate similarity between resume and job description using embeddings
    
    Args:
        resume_text: Resume text content
        job_description: Job description text
        
    Returns:
        Dictionary with similarityScore (0-1) and atsScore (0-100)
    """
    try:
        # Generate embeddings
        embeddings = embedding_model.encode([resume_text, job_description])
        
        # Calculate cosine similarity
        similarity_matrix = cosine_similarity([embeddings[0]], [embeddings[1]])
        similarity_score = float(similarity_matrix[0][0])
        
        # Ensure score is between 0 and 1
        similarity_score = max(0.0, min(1.0, similarity_score))
        
        # Normalize to ATS-style score (0-100)
        # Apply a scaling factor to make scores more realistic
        # Most ATS systems show scores in 60-95 range for good matches
        ats_score = normalize_to_ats_score(similarity_score)
        
        return {
            "similarityScore": similarity_score,
            "atsScore": ats_score
        }
        
    except Exception as e:
        logger.error(f"Similarity calculation failed: {e}")
        raise Exception(f"Similarity calculation failed: {str(e)}")

def normalize_to_ats_score(similarity: float) -> float:
    """
    Normalize similarity score (0-1) to ATS-style score (0-100)
    Uses a curve that maps:
    - 0.0-0.5 similarity → 0-60 ATS score (poor match)
    - 0.5-0.7 similarity → 60-75 ATS score (fair match)
    - 0.7-0.85 similarity → 75-88 ATS score (good match)
    - 0.85-1.0 similarity → 88-100 ATS score (excellent match)
    """
    if similarity <= 0.5:
        # Linear mapping for low scores
        ats = similarity * 120  # 0.5 -> 60
    elif similarity <= 0.7:
        # Steeper curve for mid scores
        ats = 60 + (similarity - 0.5) * 75  # 0.7 -> 75
    elif similarity <= 0.85:
        # Moderate curve for good scores
        ats = 75 + (similarity - 0.7) * 86.67  # 0.85 -> 88
    else:
        # Steep curve for excellent scores
        ats = 88 + (similarity - 0.85) * 80  # 1.0 -> 100
    
    return round(max(0.0, min(100.0, ats)), 1)
