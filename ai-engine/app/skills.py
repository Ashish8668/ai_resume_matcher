"""
Skill extraction using NLP (spaCy) and pattern matching
"""
import spacy
import re
from typing import List, Dict, Set
import logging
from app.config import config

logger = logging.getLogger(__name__)

# Load spaCy model (lazy loading)
_nlp = None

def get_nlp():
    """Get or load spaCy model"""
    global _nlp
    if _nlp is None:
        try:
            logger.info(f"Loading spaCy model: {config.SPACY_MODEL}")
            _nlp = spacy.load(config.SPACY_MODEL)
            logger.info("✅ spaCy model loaded successfully")
        except OSError as e:
            error_msg = f"❌ spaCy model '{config.SPACY_MODEL}' not found. Run: python -m spacy download {config.SPACY_MODEL}"
            logger.error(error_msg)
            logger.warning("⚠️  Falling back to pattern-based skill extraction")
            # Don't raise - allow fallback to pattern matching
            _nlp = None
    return _nlp

# Technical skills database (normalized)
TECHNICAL_SKILLS = {
    # Programming Languages
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'php',
    'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'shell',
    
    # Frontend
    'react', 'vue', 'angular', 'html', 'css', 'sass', 'less', 'webpack',
    'babel', 'next.js', 'nuxt.js', 'gatsby', 'tailwind', 'bootstrap',
    
    # Backend
    'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails',
    'laravel', 'asp.net', 'nest.js', 'graphql', 'rest api',
    
    # Databases
    'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'oracle', 'sql server',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab ci',
    'github actions', 'terraform', 'ansible', 'chef', 'puppet',
    
    # Tools & Frameworks
    'git', 'jira', 'confluence', 'slack', 'postman', 'swagger', 'graphql',
    'microservices', 'api', 'rest', 'soap',
    
    # Data Science & ML
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'data analysis',
    
    # Mobile
    'react native', 'flutter', 'ios', 'android', 'xamarin',
}

# Soft skills keywords
SOFT_SKILLS = {
    'communication', 'teamwork', 'leadership', 'problem solving', 'analytical',
    'creative', 'adaptable', 'time management', 'project management',
    'collaboration', 'critical thinking', 'attention to detail', 'agile',
    'scrum', 'kanban', 'mentoring', 'presentation', 'negotiation',
}

# Skill aliases (normalize variations)
SKILL_ALIASES = {
    'js': 'javascript',
    'node': 'node.js',
    'reactjs': 'react',
    'vuejs': 'vue',
    'angularjs': 'angular',
    'postgres': 'postgresql',
    'ml': 'machine learning',
    'dl': 'deep learning',
    'ai': 'artificial intelligence',
    'pm': 'project management',
    'golang': 'go',  # Golang is an alias for Go
}

# Skills that are ambiguous and need strict context matching
AMBIGUOUS_SKILLS = {'r', 'go', 'c', 'c++', 'c#'}

def normalize_skill(skill: str) -> str:
    """Normalize skill name (lowercase, handle aliases)"""
    skill_lower = skill.lower().strip()
    
    # Check aliases
    if skill_lower in SKILL_ALIASES:
        return SKILL_ALIASES[skill_lower]
    
    return skill_lower

def is_skill_in_context(text: str, skill: str) -> bool:
    """
    Check if a skill appears in a meaningful context (not as substring)
    For ambiguous skills like 'r' and 'go', requires programming context
    """
    text_lower = text.lower()
    skill_lower = skill.lower()
    skill_escaped = re.escape(skill_lower)
    
    # For ambiguous skills, require strict context
    if skill_lower in AMBIGUOUS_SKILLS:
        if skill_lower == 'r':
            # R must be in skills section or with programming context
            skills_section = re.search(r'skills?[:\-]?\s*.*?\b' + skill_escaped + r'\b', text_lower, re.IGNORECASE)
            programming_context = re.search(r'\b' + skill_escaped + r'\b\s+(programming|language|statistical|data|analysis)', text_lower, re.IGNORECASE)
            r_language = re.search(r'\b' + skill_escaped + r'\s+language\b', text_lower, re.IGNORECASE)
            return bool(skills_section or programming_context or r_language)
        
        elif skill_lower == 'go':
            # Go must be in skills section, with programming context, or as "Golang"
            skills_section = re.search(r'skills?[:\-]?\s*.*?\b' + skill_escaped + r'\b', text_lower, re.IGNORECASE)
            programming_context = re.search(r'\b' + skill_escaped + r'\b\s+(programming|language)', text_lower, re.IGNORECASE)
            golang = re.search(r'\bgolang\b', text_lower, re.IGNORECASE)
            go_language = re.search(r'\b' + skill_escaped + r'\s+language\b', text_lower, re.IGNORECASE)
            return bool(skills_section or programming_context or golang or go_language)
        
        else:
            # For other ambiguous skills, use negative lookahead/lookbehind
            # Match only if not part of a longer word
            pattern = r'(?<![a-z])' + skill_escaped + r'(?![a-z])'
            return bool(re.search(pattern, text_lower, re.IGNORECASE))
    
    # For normal skills, use word boundaries
    pattern = r'\b' + skill_escaped + r'\b'
    return bool(re.search(pattern, text_lower, re.IGNORECASE))

def extract_skills(text: str) -> Dict[str, List[str]]:
    """
    Extract skills from text using NLP and pattern matching
    
    Args:
        text: Text content to analyze
        
    Returns:
        Dictionary with 'skills' list and 'categories' dict
    """
    try:
        nlp = get_nlp()
        doc = nlp(text.lower())
        
        found_skills = set()
        technical_skills = []
        soft_skills = []
        
        # Extract using NLP (noun phrases, proper nouns)
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.lower().strip()
            normalized = normalize_skill(chunk_text)
            
            if normalized in TECHNICAL_SKILLS:
                found_skills.add(normalized)
                technical_skills.append(normalized)
            elif normalized in SOFT_SKILLS:
                found_skills.add(normalized)
                soft_skills.append(normalized)
        
        # Pattern matching for common skill patterns
        # Look for "Skills:" sections
        skills_section_pattern = r'skills?[:\-]?\s*([^\.]+)'
        skills_matches = re.findall(skills_section_pattern, text, re.IGNORECASE)
        
        for match in skills_matches:
            # Split by common delimiters
            skills_list = re.split(r'[,;|•\n]', match)
            for skill in skills_list:
                skill_clean = skill.strip().lower()
                normalized = normalize_skill(skill_clean)
                
                # Only add if it's an exact match (not substring)
                if normalized in TECHNICAL_SKILLS and normalized not in found_skills:
                    found_skills.add(normalized)
                    technical_skills.append(normalized)
                elif normalized in SOFT_SKILLS and normalized not in found_skills:
                    found_skills.add(normalized)
                    soft_skills.append(normalized)
        
        # Extract individual words that might be skills using strict context matching
        # This prevents "go" from matching "Google" or "r" from matching "React"
        for skill in TECHNICAL_SKILLS | SOFT_SKILLS:
            # Skip if already found
            if skill in found_skills:
                continue
            
            # Use strict context matching
            if is_skill_in_context(text, skill):
                found_skills.add(skill)
                if skill in TECHNICAL_SKILLS:
                    technical_skills.append(skill)
                elif skill in SOFT_SKILLS:
                    soft_skills.append(skill)
        
        # Remove duplicates and sort
        all_skills = sorted(list(found_skills))
        technical_skills = sorted(list(set(technical_skills)))
        soft_skills = sorted(list(set(soft_skills)))
        
        return {
            "skills": all_skills,
            "categories": {
                "technical": technical_skills,
                "soft": soft_skills
            }
        }
        
    except Exception as e:
        logger.error(f"Skill extraction failed: {e}")
        # Fallback to simple pattern matching
        return extract_skills_fallback(text)

def extract_skills_fallback(text: str) -> Dict[str, List[str]]:
    """Fallback skill extraction using word boundary matching with strict filtering"""
    import re
    text_lower = text.lower()
    found_skills = []
    
    # Use word boundaries to avoid substring matches
    # e.g., "go" should match "go" but not "Google" or "ago"
    for skill in TECHNICAL_SKILLS | SOFT_SKILLS:
        # Use strict context matching
        if is_skill_in_context(text, skill):
            found_skills.append(skill)
    
    technical = [s for s in found_skills if s in TECHNICAL_SKILLS]
    soft = [s for s in found_skills if s in SOFT_SKILLS]
    
    return {
        "skills": sorted(found_skills),
        "categories": {
            "technical": sorted(technical),
            "soft": sorted(soft)
        }
    }
