/**
 * AI Service Client
 * Communicates with FastAPI AI Engine (internal)
 */
const axios = require('axios');
const { AI_ENGINE_URL } = require('../config/env');

const aiClient = axios.create({
  baseURL: AI_ENGINE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health check for AI engine
 */
const checkAIHealth = async () => {
  try {
    const response = await aiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`AI engine health check failed: ${error.message}`);
  }
};

/**
 * Calculate similarity between resume and job description
 */
const calculateSimilarity = async (resumeText, jobDescription) => {
  try {
    const response = await aiClient.post('/api/similarity', {
      resumeText,
      jobDescription,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Similarity calculation failed: ${error.message}`);
  }
};

/**
 * Extract skills from text
 */
const extractSkills = async (text) => {
  try {
    const response = await aiClient.post('/api/skills/extract', {
      text,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Skill extraction failed: ${error.message}`);
  }
};

/**
 * Analyze skill gap
 */
const analyzeSkillGap = async (resumeSkills, jobSkills) => {
  try {
    const response = await aiClient.post('/api/skills/gap', {
      resumeSkills,
      jobSkills,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Skill gap analysis failed: ${error.message}`);
  }
};

/**
 * Generate suggestions
 */
const generateSuggestions = async (resumeText, jobDescription, missingSkills) => {
  try {
    const response = await aiClient.post('/api/suggestions', {
      resumeText,
      jobDescription,
      missingSkills,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Suggestion generation failed: ${error.message}`);
  }
};

module.exports = {
  checkAIHealth,
  calculateSimilarity,
  extractSkills,
  analyzeSkillGap,
  generateSuggestions,
};
