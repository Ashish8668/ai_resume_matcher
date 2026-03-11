import pytest
from app.similarity import calculate_similarity
from app.skills import extract_skills

class TestSimilarity:
    def test_identical_texts(self):
        """Test similarity of identical texts"""
        text = "Python developer with 5 years experience"
        score = calculate_similarity(text, text)
        assert score == 1.0
    
    def test_completely_different_texts(self):
        """Test similarity of completely different texts"""
        resume = "Cooking and culinary arts"
        job_desc = "Machine learning engineer"
        score = calculate_similarity(resume, job_desc)
        assert score >= 0.0
        assert score <= 1.0
    
    def test_similarity_score_range(self):
        """Test that similarity score is between 0 and 1"""
        resume = "Python Django REST API"
        job_desc = "Looking for Python developer"
        score = calculate_similarity(resume, job_desc)
        assert 0 <= score <= 1

class TestSkillsExtraction:
    def test_extract_programming_skills(self):
        """Test extraction of programming skills"""
        text = "Experienced in Python and JavaScript"
        skills = extract_skills(text)
        assert "python" in skills
        assert "javascript" in skills
    
    def test_extract_framework_skills(self):
        """Test extraction of framework skills"""
        text = "Full-stack developer using React and Node.js"
        skills = extract_skills(text)
        assert "react" in skills
        assert "node.js" in skills
    
    def test_extract_tool_skills(self):
        """Test extraction of tool skills"""
        text = "DevOps engineer proficient in Docker and Kubernetes"
        skills = extract_skills(text)
        assert "docker" in skills
        assert "kubernetes" in skills
