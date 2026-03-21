/**
 * Express Application Setup
 */
const express = require('express');
const { validateEnv } = require('./config/env');
const connectDB = require('./config/db');
const cors = require('./config/cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const healthRoutes = require('./routes/health.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const resumeRoutes = require('./routes/resume.routes');
const matchRoutes = require('./routes/match.routes');

// Validate environment variables
validateEnv();

// Initialize Express app
const app = express();

// Connect to Firestore
connectDB();

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Routes
app.use('/health', healthRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/match', matchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
