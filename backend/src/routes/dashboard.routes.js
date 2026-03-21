/**
 * Dashboard routes
 */
const express = require('express');
const path = require('path');
const { getActiveResume } = require('../repositories/resumeRepository');
const { getLatestAnalysisSession } = require('../repositories/analysisRepository');
const { splitIntoChunks, getTextStats, summarizeText } = require('../utils/textAnalytics');
const { createPdfBuffer } = require('../utils/pdfReport');

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
      section: chunk.section || 'General',
      strategy: chunk.strategy || 'word_window',
      startWord: chunk.startWord,
      endWord: chunk.endWord,
      wordCount: chunk.wordCount,
      charCount: chunk.charCount,
      preview: chunk.preview,
    }));
    const isSectionBased = chunks.some((chunk) => chunk.strategy === 'section');

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
          strategy: isSectionBased ? 'section' : 'word_window',
          sectionLabels: isSectionBased ? ['Summary', 'Education', 'Experience', 'Projects', 'Achievements', 'Certifications'] : [],
          chunkSizeWords: isSectionBased ? null : 180,
          overlapWords: isSectionBased ? null : 30,
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

router.get('/report/pdf', async (req, res) => {
  try {
    const resume = await getActiveResume();
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found. Please upload a resume first.',
        code: 'RESUME_NOT_FOUND',
      });
    }

    const latestAnalysis = await getLatestAnalysisSession();
    if (!latestAnalysis) {
      return res.status(404).json({
        success: false,
        error: 'No analysis run found. Run /api/match first.',
        code: 'ANALYSIS_NOT_FOUND',
      });
    }

    const pdfBuffer = createPdfBuffer({
      resume,
      analysis: latestAnalysis,
    });

    const safeTitle = String(latestAnalysis.jobTitle || 'analysis')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'analysis';
    const fileName = `resume-match-report-${safeTitle}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      code: 'REPORT_GENERATION_ERROR',
    });
  }
});

module.exports = router;
