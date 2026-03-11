/**
 * Resume Routes
 * Handles resume upload and retrieval
 * All routes require UUID validation middleware
 */
const express = require('express');
const multer = require('multer');
const Resume = require('../models/Resume');
const { parsePDF } = require('../utils/pdfParser');

const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

/**
 * POST /api/resume/upload
 * Upload resume PDF, extract text, store text only
 */
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please provide a PDF file.',
        code: 'MISSING_FILE'
      });
    }
    
    // Get UUID from middleware
    const uuid = req.userUUID;
    
    // Parse PDF and extract text
    const resumeText = await parsePDF(req.file.buffer);
    
    // PDF buffer is now discarded (garbage collected)
    
    // Upsert resume (one resume per UUID)
    const resume = await Resume.findOneAndUpdate(
      { uuid },
      {
        uuid,
        resumeText,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    
    // Return success with preview
    res.json({
      success: true,
      uuid: resume.uuid,
      resumeText: resume.resumeText.substring(0, 200) + '...', // Preview only
      message: 'Resume uploaded successfully',
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      code: error.code || 'UPLOAD_ERROR'
    });
  }
});

/**
 * GET /api/resume
 * Get resume text for the UUID
 */
router.get('/', async (req, res) => {
  try {
    const uuid = req.userUUID;
    
    const resume = await Resume.findOne({ uuid });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found. Please upload a resume first.',
        code: 'RESUME_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      resume: {
        uuid: resume.uuid,
        resumeText: resume.resumeText,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'DATABASE_ERROR'
    });
  }
});

module.exports = router;
