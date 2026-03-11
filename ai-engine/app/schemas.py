"""
Pydantic schemas for API requests and responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class SimilarityRequest(BaseModel):
    """Request schema for similarity calculation"""
    resumeText: str = Field(..., description="Resume text content")
    jobDescription: str = Field(..., description="Job description text")

class SimilarityResponse(BaseModel):
    """Response schema for similarity calculation"""
    similarityScore: float = Field(..., ge=0, le=1, description="Similarity score 0-1")
    atsScore: float = Field(..., ge=0, le=100, description="ATS-style score 0-100")

class SkillExtractionRequest(BaseModel):
    """Request schema for skill extraction"""
    text: str = Field(..., description="Text to extract skills from")

class SkillExtractionResponse(BaseModel):
    """Response schema for skill extraction"""
    skills: List[str] = Field(..., description="List of extracted skills")
    categories: Dict[str, List[str]] = Field(default_factory=dict, description="Skills by category")

class SkillGapRequest(BaseModel):
    """Request schema for skill gap analysis"""
    resumeSkills: List[str] = Field(..., description="Skills from resume")
    jobSkills: List[str] = Field(..., description="Skills from job description")

class SkillInfo(BaseModel):
    """Skill information"""
    skill: str
    importance: float = Field(..., ge=0, le=1)
    category: str = "technical"

class SkillGapResponse(BaseModel):
    """Response schema for skill gap analysis"""
    missingSkills: List[SkillInfo] = Field(default_factory=list)
    matchedSkills: List[SkillInfo] = Field(default_factory=list)
    gapScore: float = Field(..., ge=0, le=1)

class SuggestionsRequest(BaseModel):
    """Request schema for suggestions generation"""
    resumeText: str = Field(..., description="Resume text")
    jobDescription: str = Field(..., description="Job description")
    missingSkills: List[str] = Field(default_factory=list, description="Missing skills")

class ProjectIdea(BaseModel):
    """Project idea schema"""
    title: str
    description: str
    skills: List[str]
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    estimatedTime: str = "2-3 weeks"

class SuggestionsResponse(BaseModel):
    """Response schema for suggestions"""
    keywordSuggestions: List[str] = Field(default_factory=list)
    bulletSuggestions: List[str] = Field(default_factory=list)
    techAlignmentTips: List[str] = Field(default_factory=list)
    projectIdeas: List[ProjectIdea] = Field(default_factory=list)
