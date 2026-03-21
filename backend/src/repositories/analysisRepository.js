/**
 * Analysis session repository for Firestore
 */
const dbConfig = require('../config/db');
const { ACTIVE_RESUME_ID } = require('./resumeRepository');

const RESUMES_COLLECTION = 'resumes';
const ANALYSIS_SUBCOLLECTION = 'analysisSessions';

const toISOStringOrNull = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const mapAnalysisDoc = (doc) => {
  if (!doc || !doc.exists) return null;
  const data = doc.data() || {};

  return {
    id: doc.id,
    createdAt: toISOStringOrNull(data.createdAt),
    jobTitle: data.jobTitle || '',
    companyName: data.companyName || '',
    jobDescriptionPreview: data.jobDescriptionPreview || '',
    totalDurationMs: data.totalDurationMs || 0,
    stages: Array.isArray(data.stages) ? data.stages : [],
    resultSnapshot: data.resultSnapshot || {},
  };
};

const createAnalysisSession = async (sessionData) => {
  const db = dbConfig.getFirestore();
  const analysisRef = db
    .collection(RESUMES_COLLECTION)
    .doc(ACTIVE_RESUME_ID)
    .collection(ANALYSIS_SUBCOLLECTION);

  await analysisRef.add({
    ...sessionData,
    createdAt: dbConfig.serverTimestamp(),
  });
};

const getLatestAnalysisSession = async () => {
  const db = dbConfig.getFirestore();
  const analysisRef = db
    .collection(RESUMES_COLLECTION)
    .doc(ACTIVE_RESUME_ID)
    .collection(ANALYSIS_SUBCOLLECTION);

  const snapshot = await analysisRef.orderBy('createdAt', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  return mapAnalysisDoc(snapshot.docs[0]);
};

module.exports = {
  createAnalysisSession,
  getLatestAnalysisSession,
};
