"""
FastAPI AI Engine - Main Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import config
from app.schemas import (
    SimilarityRequest, SimilarityResponse,
    SkillExtractionRequest, SkillExtractionResponse,
    SkillGapRequest, SkillGapResponse,
    SuggestionsRequest, SuggestionsResponse
)
from app.similarity import calculate_similarity
from app.skills import extract_skills
from app.gap_analysis import analyze_skill_gap
from app.suggestions import generate_suggestions

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Resume Matcher Engine",
    description="NLP-powered resume matching and analysis engine",
    version="1.0.0"
)

# CORS Middleware (only allow backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # Backend only
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Initialize models on startup
@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    try:
        logger.info("Initializing AI Engine...")
        
        # Import models to trigger loading
        from app.models import embedding_model
        from app.skills import get_nlp
        
        # Pre-load models
        embedding_model.encode("test")  # Trigger model loading
        
        # Try to load spaCy (non-critical - has fallback)
        try:
            get_nlp()  # Trigger spaCy loading
        except Exception as e:
            logger.warning(f"⚠️  spaCy model not available: {e}")
            logger.warning("⚠️  Skill extraction will use pattern matching fallback")
        
        logger.info("✅ AI Engine initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize AI Engine: {e}")
        raise

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        from app.models import embedding_model
        from app.skills import get_nlp
        
        models_status = {
            "sentenceTransformer": "loaded" if embedding_model.model else "not loaded",
            "spacy": "loaded" if get_nlp() else "not loaded"
        }
        
        return {
            "status": "OK",
            "models": models_status
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "error": str(e)
        }

@app.post("/api/similarity", response_model=SimilarityResponse)
async def calculate_similarity_endpoint(request: SimilarityRequest):
    """Calculate similarity between resume and job description"""
    try:
        result = calculate_similarity(request.resumeText, request.jobDescription)
        return SimilarityResponse(**result)
    except Exception as e:
        logger.error(f"Similarity calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/skills/extract", response_model=SkillExtractionResponse)
async def extract_skills_endpoint(request: SkillExtractionRequest):
    """Extract skills from text"""
    try:
        result = extract_skills(request.text)
        return SkillExtractionResponse(**result)
    except Exception as e:
        logger.error(f"Skill extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/skills/gap", response_model=SkillGapResponse)
async def analyze_skill_gap_endpoint(request: SkillGapRequest):
    """Analyze skill gap between resume and job requirements"""
    try:
        result = analyze_skill_gap(request.resumeSkills, request.jobSkills)
        return SkillGapResponse(**result)
    except Exception as e:
        logger.error(f"Skill gap analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suggestions", response_model=SuggestionsResponse)
async def generate_suggestions_endpoint(request: SuggestionsRequest):
    """Generate resume improvement suggestions and project ideas"""
    try:
        result = generate_suggestions(
            request.resumeText,
            request.jobDescription,
            request.missingSkills
        )
        return SuggestionsResponse(**result)
    except Exception as e:
        logger.error(f"Suggestion generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=config.HOST,
        port=config.PORT,
        log_level="info"
    )
