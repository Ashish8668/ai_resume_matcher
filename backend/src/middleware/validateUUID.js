/**
 * UUID Validation Middleware
 * Validates X-User-UUID header on every request (except /health)
 */
const { validate: validateUUID } = require('uuid');
const { UUID_VALIDATION_ENABLED } = require('../config/env');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateUUIDMiddleware = (req, res, next) => {
  // Skip validation if disabled (for testing)
  if (!UUID_VALIDATION_ENABLED) {
    return next();
  }
  
  // Skip validation for health check
  if (req.path === '/health') {
    return next();
  }
  
  // Get UUID from header
  const uuid = req.headers['x-user-uuid'];
  
  if (!uuid) {
    return res.status(400).json({
      success: false,
      error: 'Missing X-User-UUID header',
      code: 'MISSING_UUID'
    });
  }
  
  // Validate UUID format (RFC 4122 UUID v4)
  if (!validateUUID(uuid) || !UUID_REGEX.test(uuid)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid UUID format. Must be a valid UUID v4.',
      code: 'INVALID_UUID'
    });
  }
  
  // Attach UUID to request object for use in routes
  req.userUUID = uuid;
  
  next();
};

module.exports = validateUUIDMiddleware;
