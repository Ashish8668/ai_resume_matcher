/**
 * Analysis Session Model
 * Stores latest processing telemetry for dashboard views
 */
const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    durationMs: { type: Number, required: true, min: 0 },
    outputSummary: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const analysisSessionSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    jobDescriptionPreview: {
      type: String,
      default: '',
      maxlength: 1200,
    },
    totalDurationMs: {
      type: Number,
      required: true,
      min: 0,
    },
    stages: {
      type: [stageSchema],
      default: [],
    },
    resultSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

analysisSessionSchema.index({ uuid: 1, createdAt: -1 });

const AnalysisSession = mongoose.model('AnalysisSession', analysisSessionSchema);

module.exports = AnalysisSession;
