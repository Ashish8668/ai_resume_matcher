"""
Skill gap analysis between resume and job requirements
"""
from typing import List, Dict
from typing import Tuple
from app.models import embedding_model
from app.skills import extract_skills, TECHNICAL_SKILLS, SOFT_SKILLS
from app.schemas import SkillInfo
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

def analyze_skill_gap(resume_skills: List[str], job_skills: List[str]) -> Dict:
    """
    Analyze skill gap between resume and job requirements
    
    Args:
        resume_skills: List of skills from resume
        job_skills: List of skills from job description
        
    Returns:
        Dictionary with missingSkills, matchedSkills, and gapScore
    """
    try:
        resume_set = set(skill.lower() for skill in resume_skills)
        job_set = set(skill.lower() for skill in job_skills)
        
        # Direct matches
        matched = resume_set & job_set
        
        # Missing skills (in job but not in resume)
        missing = job_set - resume_set
        
        # Use embeddings to find semantic matches (e.g., "JS" vs "JavaScript")
        matched_with_semantic, missing_with_semantic = find_semantic_matches(
            list(resume_set),
            list(job_set),
            matched,
            missing
        )
        
        # Calculate importance scores for missing skills
        missing_skills_info = []
        for skill in missing_with_semantic:
            importance = calculate_skill_importance(skill, job_skills)
            category = "technical" if skill.lower() in TECHNICAL_SKILLS else "soft"
            missing_skills_info.append(SkillInfo(
                skill=skill,
                importance=importance,
                category=category
            ))
        
        # Sort by importance
        missing_skills_info.sort(key=lambda x: x.importance, reverse=True)
        
        # Calculate relevance scores for matched skills
        matched_skills_info = []
        for skill in matched_with_semantic:
            relevance = calculate_skill_relevance(skill, job_skills)
            category = "technical" if skill.lower() in TECHNICAL_SKILLS else "soft"
            matched_skills_info.append(SkillInfo(
                skill=skill,
                importance=relevance,
                category=category
            ))
        
        # Sort by relevance
        matched_skills_info.sort(key=lambda x: x.importance, reverse=True)
        
        # Calculate gap score (0 = perfect match, 1 = completely different)
        gap_score = len(missing_with_semantic) / max(len(job_set), 1)
        gap_score = min(1.0, gap_score)
        
        return {
            "missingSkills": [s.dict() for s in missing_skills_info],
            "matchedSkills": [s.dict() for s in matched_skills_info],
            "gapScore": round(gap_score, 2)
        }
        
    except Exception as e:
        logger.error(f"Skill gap analysis failed: {e}")
        raise Exception(f"Skill gap analysis failed: {str(e)}")

def find_semantic_matches(
    resume_skills: List[str],
    job_skills: List[str],
    direct_matched: set,
    direct_missing: set
) -> Tuple[List[str], List[str]]:
    """
    Find semantic matches using embeddings to catch variations
    """
    try:
        # Get embeddings for all skills
        all_skills = list(set(resume_skills + job_skills))
        if len(all_skills) == 0:
            return list(direct_matched), list(direct_missing)
        
        embeddings = embedding_model.encode(all_skills)
        
        # Create skill to index mapping
        skill_to_idx = {skill: i for i, skill in enumerate(all_skills)}
        
        # Find semantic matches
        semantic_matched = set(direct_matched)
        semantic_missing = set(direct_missing)
        
        # For each missing skill, check if there's a semantic match in resume
        for missing_skill in list(direct_missing):
            if missing_skill not in all_skills:
                continue
            
            missing_idx = skill_to_idx[missing_skill]
            missing_embedding = embeddings[missing_idx:missing_idx+1]
            
            # Compare with resume skills
            best_match = None
            best_score = 0.85  # Threshold for semantic similarity
            
            for resume_skill in resume_skills:
                if resume_skill in direct_matched:
                    continue
                
                if resume_skill not in all_skills:
                    continue
                
                resume_idx = skill_to_idx[resume_skill]
                resume_embedding = embeddings[resume_idx:resume_idx+1]
                
                similarity = cosine_similarity(missing_embedding, resume_embedding)[0][0]
                
                if similarity > best_score:
                    best_score = similarity
                    best_match = resume_skill
            
            if best_match:
                # Found semantic match
                semantic_matched.add(best_match)
                semantic_missing.discard(missing_skill)
        
        return list(semantic_matched), list(semantic_missing)
        
    except Exception as e:
        logger.warning(f"Semantic matching failed, using direct matches: {e}")
        return list(direct_matched), list(direct_missing)

def calculate_skill_importance(skill: str, job_skills: List[str]) -> float:
    """
    Calculate importance of a skill based on frequency in job description
    """
    job_lower = [s.lower() for s in job_skills]
    skill_lower = skill.lower()
    
    # Count occurrences
    count = job_lower.count(skill_lower)
    
    # Normalize to 0-1 (max importance if mentioned 3+ times)
    importance = min(1.0, count / 3.0)
    
    # Boost for technical skills
    if skill_lower in TECHNICAL_SKILLS:
        importance = min(1.0, importance + 0.2)
    
    return round(importance, 2)

def calculate_skill_relevance(skill: str, job_skills: List[str]) -> float:
    """
    Calculate relevance score for matched skills
    """
    return calculate_skill_importance(skill, job_skills)
