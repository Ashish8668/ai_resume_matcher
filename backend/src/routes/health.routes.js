/**
 * Health Check Routes
 */
const express = require('express');
const router = express.Router();
const { checkAIHealth } = require('../services/aiService');

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Check AI engine health
    let aiHealth = null;
    try {
      aiHealth = await checkAIHealth();
    } catch (error) {
      aiHealth = { status: 'unavailable', error: error.message };
    }
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'backend-api',
      aiEngine: aiHealth,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
});

module.exports = router;
