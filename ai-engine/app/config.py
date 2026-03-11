"""
Configuration for AI Engine
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8000))
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    
    # Model configurations
    SENTENCE_TRANSFORMER_MODEL = os.getenv('SENTENCE_TRANSFORMER_MODEL', 'all-MiniLM-L6-v2')
    SPACY_MODEL = os.getenv('SPACY_MODEL', 'en_core_web_sm')
    
    # Backend URL (for health checks)
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')

config = Config()
