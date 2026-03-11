"""
Generate resume improvement suggestions and project ideas
"""
from typing import List, Dict
from app.schemas import ProjectIdea
import logging

logger = logging.getLogger(__name__)

# Project ideas database
PROJECT_IDEAS_DB = {
    'react': [
        {
            "title": "Build a React Todo App with TypeScript",
            "description": "Create a full-stack todo application using React, TypeScript, and Node.js. Implement features like task creation, editing, deletion, filtering, and local storage persistence. This project demonstrates component-based architecture, state management, and modern JavaScript practices.",
            "skills": ["React", "TypeScript", "State Management", "REST APIs"],
            "difficulty": "beginner",
            "estimatedTime": "2-3 weeks"
        },
        {
            "title": "E-commerce Dashboard with React",
            "description": "Build an admin dashboard for an e-commerce platform using React, TypeScript, and modern UI libraries. Focus on data visualization, CRUD operations, and responsive design. Integrate with a REST API backend.",
            "skills": ["React", "TypeScript", "Data Visualization", "REST APIs"],
            "difficulty": "intermediate",
            "estimatedTime": "3-4 weeks"
        }
    ],
    'typescript': [
        {
            "title": "TypeScript REST API Server",
            "description": "Build a RESTful API server using TypeScript, Node.js, and Express. Implement authentication, CRUD operations, input validation, and error handling. Use TypeScript's type system to ensure type safety throughout the application.",
            "skills": ["TypeScript", "Node.js", "Express", "REST APIs"],
            "difficulty": "intermediate",
            "estimatedTime": "2-3 weeks"
        }
    ],
    'python': [
        {
            "title": "Python Web Scraper with Data Analysis",
            "description": "Build a web scraper using Python (BeautifulSoup/Scrapy) to collect data, then analyze it using pandas and visualize with matplotlib. Store results in a database and create a simple web interface to display insights.",
            "skills": ["Python", "Web Scraping", "Data Analysis", "Pandas"],
            "difficulty": "beginner",
            "estimatedTime": "2-3 weeks"
        },
        {
            "title": "Machine Learning Model Deployment",
            "description": "Train a machine learning model using scikit-learn or TensorFlow, then deploy it as a REST API using FastAPI. Include model versioning, input validation, and performance monitoring.",
            "skills": ["Python", "Machine Learning", "FastAPI", "REST APIs"],
            "difficulty": "advanced",
            "estimatedTime": "4-5 weeks"
        }
    ],
    'node.js': [
        {
            "title": "Real-time Chat Application",
            "description": "Build a real-time chat application using Node.js, Socket.io, and React. Implement features like private messaging, group chats, file sharing, and online status indicators.",
            "skills": ["Node.js", "Socket.io", "React", "Real-time"],
            "difficulty": "intermediate",
            "estimatedTime": "3-4 weeks"
        }
    ],
    'mongodb': [
        {
            "title": "Blog Platform with MongoDB",
            "description": "Create a full-stack blog platform with user authentication, post creation/editing, comments, and search functionality. Use MongoDB for data storage and implement proper indexing for performance.",
            "skills": ["MongoDB", "Node.js", "Express", "Authentication"],
            "difficulty": "intermediate",
            "estimatedTime": "3-4 weeks"
        }
    ],
    'aws': [
        {
            "title": "Serverless API with AWS Lambda",
            "description": "Build a serverless REST API using AWS Lambda, API Gateway, and DynamoDB. Implement authentication with AWS Cognito, add logging with CloudWatch, and set up CI/CD with GitHub Actions.",
            "skills": ["AWS", "Lambda", "API Gateway", "Serverless"],
            "difficulty": "advanced",
            "estimatedTime": "4-5 weeks"
        }
    ],
    'docker': [
        {
            "title": "Containerized Microservices Application",
            "description": "Build a microservices application with multiple services, containerize each with Docker, and orchestrate with Docker Compose. Include service discovery, API gateway, and database services.",
            "skills": ["Docker", "Microservices", "API Gateway", "Containerization"],
            "difficulty": "advanced",
            "estimatedTime": "4-6 weeks"
        }
    ]
}

def generate_suggestions(
    resume_text: str,
    job_description: str,
    missing_skills: List[str]
) -> Dict:
    """
    Generate resume improvement suggestions and project ideas
    
    Args:
        resume_text: Resume text
        job_description: Job description
        missing_skills: List of missing skills
        
    Returns:
        Dictionary with keywordSuggestions, bulletSuggestions, techAlignmentTips, and projectIdeas
    """
    try:
        keyword_suggestions = generate_keyword_suggestions(missing_skills)
        bullet_suggestions = generate_bullet_suggestions(missing_skills, job_description)
        tech_tips = generate_tech_alignment_tips(resume_text, job_description, missing_skills)
        project_ideas = generate_project_ideas(missing_skills)
        
        return {
            "keywordSuggestions": keyword_suggestions,
            "bulletSuggestions": bullet_suggestions,
            "techAlignmentTips": tech_tips,
            "projectIdeas": [idea.dict() for idea in project_ideas]
        }
        
    except Exception as e:
        logger.error(f"Suggestion generation failed: {e}")
        return {
            "keywordSuggestions": [],
            "bulletSuggestions": [],
            "techAlignmentTips": [],
            "projectIdeas": []
        }

def generate_keyword_suggestions(missing_skills: List[str]) -> List[str]:
    """Generate keyword insertion suggestions"""
    suggestions = []
    
    for skill in missing_skills[:5]:  # Top 5 missing skills
        suggestions.append(f"Add '{skill}' to your skills section")
        suggestions.append(f"Mention '{skill}' in your experience section")
    
    return suggestions[:10]  # Limit to 10

def generate_bullet_suggestions(missing_skills: List[str], job_description: str) -> List[str]:
    """Generate bullet point improvement suggestions"""
    suggestions = []
    
    # Analyze job description for key themes
    job_lower = job_description.lower()
    
    if 'api' in job_lower or 'rest' in job_lower:
        suggestions.append("Highlight experience with REST APIs and API integration")
    
    if 'component' in job_lower or 'ui' in job_lower:
        suggestions.append("Emphasize component-based architecture and UI development")
    
    if 'microservices' in job_lower:
        suggestions.append("Highlight experience with microservices architecture")
    
    if 'cloud' in job_lower or 'aws' in job_lower or 'azure' in job_lower:
        suggestions.append("Mention cloud platform experience and deployment practices")
    
    # Skill-specific suggestions
    for skill in missing_skills[:3]:
        skill_lower = skill.lower()
        if skill_lower in ['react', 'vue', 'angular']:
            suggestions.append(f"Highlight experience with modern frontend frameworks like {skill}")
        elif skill_lower in ['python', 'javascript', 'typescript']:
            suggestions.append(f"Emphasize proficiency with {skill} and modern language features")
        elif skill_lower in ['docker', 'kubernetes']:
            suggestions.append(f"Mention experience with containerization and orchestration tools")
    
    return suggestions[:8]  # Limit to 8

def generate_tech_alignment_tips(resume_text: str, job_description: str, missing_skills: List[str]) -> List[str]:
    """Generate technology alignment tips"""
    tips = []
    
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()
    
    # Find overlapping technologies
    if 'javascript' in resume_lower and 'react' in missing_skills:
        tips.append("Your JavaScript experience aligns well with React - consider highlighting modern JS features")
    
    if 'node.js' in resume_lower and 'express' in job_lower:
        tips.append("Your Node.js experience is relevant - emphasize backend development experience")
    
    if 'python' in resume_lower and 'api' in job_lower:
        tips.append("Your Python skills are valuable for API development - highlight REST API experience")
    
    if 'sql' in resume_lower or 'database' in resume_lower:
        tips.append("Your database experience is relevant - emphasize data modeling and query optimization")
    
    return tips[:5]  # Limit to 5

def generate_project_ideas(missing_skills: List[str]) -> List[ProjectIdea]:
    """Generate project ideas based on missing skills"""
    ideas = []
    seen_titles = set()
    
    # Get project ideas for missing skills
    for skill in missing_skills:
        skill_lower = skill.lower()
        
        # Check direct match
        if skill_lower in PROJECT_IDEAS_DB:
            for idea_data in PROJECT_IDEAS_DB[skill_lower]:
                if idea_data["title"] not in seen_titles:
                    ideas.append(ProjectIdea(**idea_data))
                    seen_titles.add(idea_data["title"])
        
        # Check partial matches (e.g., "react native" -> "react")
        for key, project_list in PROJECT_IDEAS_DB.items():
            if key in skill_lower or skill_lower in key:
                for idea_data in project_list:
                    if idea_data["title"] not in seen_titles:
                        ideas.append(ProjectIdea(**idea_data))
                        seen_titles.add(idea_data["title"])
    
    # If no specific ideas, provide generic ones
    if len(ideas) == 0:
        ideas.append(ProjectIdea(
            title="Build a Portfolio Website",
            description="Create a personal portfolio website showcasing your projects and skills. Use modern web technologies and deploy it to a cloud platform.",
            skills=["Web Development", "Deployment", "UI/UX"],
            difficulty="beginner",
            estimatedTime="1-2 weeks"
        ))
    
    return ideas[:5]  # Limit to 5 project ideas
