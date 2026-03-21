/**
 * Dashboard routes
 */
const express = require('express');
const path = require('path');
const { getActiveResume } = require('../repositories/resumeRepository');
const { getLatestAnalysisSession } = require('../repositories/analysisRepository');
const { splitIntoChunks, getTextStats, summarizeText } = require('../utils/textAnalytics');

const router = express.Router();

router.get('/', (req, res) => {
  const dashboardPath = path.join(__dirname, '..', 'public', 'dashboard.html');
  return res.sendFile(dashboardPath);
});

router.get('/analytics', async (req, res) => {
  try {
    const resume = await getActiveResume();
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found. Please upload a resume first.',
        code: 'RESUME_NOT_FOUND',
      });
    }

    const textStats = getTextStats(resume.resumeText);
    const chunks = splitIntoChunks(resume.resumeText).map((chunk) => ({
      index: chunk.index,
      startWord: chunk.startWord,
      endWord: chunk.endWord,
      wordCount: chunk.wordCount,
      charCount: chunk.charCount,
      preview: chunk.preview,
    }));

    const latestAnalysis = await getLatestAnalysisSession();

    return res.json({
      success: true,
      dashboard: {
        resume: {
          updatedAt: resume.updatedAt,
          createdAt: resume.createdAt,
          preview: summarizeText(resume.resumeText, 75),
          textStats,
        },
        chunking: {
          chunkSizeWords: 180,
          overlapWords: 30,
          chunkCount: chunks.length,
          chunks,
        },
        latestAnalysis: latestAnalysis
          ? {
              id: latestAnalysis.id,
              createdAt: latestAnalysis.createdAt,
              jobTitle: latestAnalysis.jobTitle || '',
              companyName: latestAnalysis.companyName || '',
              jobDescriptionPreview: latestAnalysis.jobDescriptionPreview || '',
              totalDurationMs: latestAnalysis.totalDurationMs || 0,
              stages: latestAnalysis.stages || [],
              resultSnapshot: latestAnalysis.resultSnapshot || {},
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      code: 'DASHBOARD_ERROR',
    });
  }
});

module.exports = router;
