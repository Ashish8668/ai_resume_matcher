/**
 * Resume Model
 * Stores ONLY extracted text (no PDF, no binary data)
 * One resume per UUID (upsert on upload)
 */
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    index: true,
    unique: true,
    trim: true,
  },
  resumeText: {
    type: String,
    required: true,
    maxlength: 50000, // Max 50KB of text
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false, // We handle timestamps manually
});

// Update updatedAt before saving
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster lookups
resumeSchema.index({ uuid: 1 });

// TTL index for cleanup (optional - 1 year)
// resumeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
