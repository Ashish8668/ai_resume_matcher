/**
 * Request Logger Middleware
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const uuid = req.headers['x-user-uuid'] || 'no-uuid';
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - UUID: ${uuid.substring(0, 8)}...`
    );
  });
  
  next();
};

module.exports = logger;
