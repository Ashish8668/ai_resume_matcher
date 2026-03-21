/**
 * Match Routes
 * Handles resume-job matching requests
 */
const express = require('express');
const router = express.Router();
const { getActiveResume } = require('../repositories/resumeRepository');
const { createAnalysisSession } = require('../repositories/analysisRepository');
const { summarizeText } = require('../utils/textAnalytics');
const { performance } = require('perf_hooks');
const {
  calculateSimilarity,
  extractSkills,
  analyzeSkillGap,
  generateSuggestions,
} = require('../services/aiService');

/**
 * POST /api/match
 * Match resume with job description
 */
router.post('/', async (req, res) => {
  try {
    const processStart = performance.now();
    const { jobTitle, companyName, jobDescription } = req.body;
    
    // Validate required fields
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Get resume text
    const resume = await getActiveResume();
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found. Please upload a resume first.',
        code: 'RESUME_NOT_FOUND'
      });
    }
    
    const stages = [];

    // Extract skills from resume and job
    const skillsStart = performance.now();
    const [resumeSkillsData, jobSkillsData] = await Promise.all([
      extractSkills(resume.resumeText),
      extractSkills(jobDescription),
    ]);
    stages.push({
      name: 'skills_extraction',
      durationMs: Number((performance.now() - skillsStart).toFixed(1)),
      outputSummary: {
        resumeSkillCount: (resumeSkillsData.skills || []).length,
        jobSkillCount: (jobSkillsData.skills || []).length,
      },
    });
    
    const resumeSkills = resumeSkillsData.skills || [];
    const jobSkills = jobSkillsData.skills || [];
    
    // Calculate similarity score
    const similarityStart = performance.now();
    const similarityData = await calculateSimilarity(
      resume.resumeText,
      jobDescription
    );
    stages.push({
      name: 'similarity',
      durationMs: Number((performance.now() - similarityStart).toFixed(1)),
      outputSummary: {
        similarityScore: similarityData.similarityScore || 0,
        atsScore: similarityData.atsScore || 0,
      },
    });
    
    // Analyze skill gap
    const gapStart = performance.now();
    const gapData = await analyzeSkillGap(resumeSkills, jobSkills);
    stages.push({
      name: 'skill_gap',
      durationMs: Number((performance.now() - gapStart).toFixed(1)),
      outputSummary: {
        missingSkillsCount: (gapData.missingSkills || []).length,
        matchedSkillsCount: (gapData.matchedSkills || []).length,
        gapScore: gapData.gapScore || 0,
      },
    });
    
    // Generate suggestions
    const suggestionsStart = performance.now();
    const suggestionsData = await generateSuggestions(
      resume.resumeText,
      jobDescription,
      gapData.missingSkills?.map(s => s.skill) || []
    );
    stages.push({
      name: 'suggestions',
      durationMs: Number((performance.now() - suggestionsStart).toFixed(1)),
      outputSummary: {
        keywordSuggestionsCount: (suggestionsData.keywordSuggestions || []).length,
        bulletSuggestionsCount: (suggestionsData.bulletSuggestions || []).length,
        projectIdeasCount: (suggestionsData.projectIdeas || []).length,
      },
    });

    const totalDurationMs = Number((performance.now() - processStart).toFixed(1));
    
    // Build response
    const responsePayload = {
      success: true,
      match: {
        atsScore: similarityData.atsScore || 0,
        similarityScore: similarityData.similarityScore || 0,
        missingSkills: gapData.missingSkills || [],
        matchedSkills: gapData.matchedSkills || [],
        suggestions: {
          keywordSuggestions: suggestionsData.keywordSuggestions || [],
          bulletSuggestions: suggestionsData.bulletSuggestions || [],
          techAlignmentTips: suggestionsData.techAlignmentTips || [],
        },
        projectIdeas: suggestionsData.projectIdeas || [],
      },
    };

    // Save analysis telemetry for dashboard
    try {
      await createAnalysisSession({
        jobTitle: jobTitle || '',
        companyName: companyName || '',
        jobDescriptionPreview: summarizeText(jobDescription, 90),
        totalDurationMs,
        stages,
        resultSnapshot: responsePayload.match,
      });
    } catch (sessionError) {
      console.error('Failed to persist analysis session:', sessionError.message);
    }

    responsePayload.analysisMeta = {
      totalDurationMs,
      stageCount: stages.length,
    };

    res.json(responsePayload);
    
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to match resume',
      code: error.code || 'MATCH_ERROR'
    });
  }
});

module.exports = router;
