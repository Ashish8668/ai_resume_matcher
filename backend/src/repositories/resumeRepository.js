/**
 * Resume repository for Firestore
 */
const dbConfig = require('../config/db');

const RESUMES_COLLECTION = 'resumes';
const ACTIVE_RESUME_ID = 'active';

const toISOStringOrNull = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const mapResumeDoc = (doc) => {
  if (!doc || !doc.exists) return null;
  const data = doc.data() || {};

  return {
    id: doc.id,
    resumeText: data.resumeText || '',
    createdAt: toISOStringOrNull(data.createdAt),
    updatedAt: toISOStringOrNull(data.updatedAt),
  };
};

const getActiveResume = async () => {
  const db = dbConfig.getFirestore();
  const resumeRef = db.collection(RESUMES_COLLECTION).doc(ACTIVE_RESUME_ID);
  const snapshot = await resumeRef.get();
  return mapResumeDoc(snapshot);
};

const upsertActiveResume = async ({ resumeText }) => {
  const db = dbConfig.getFirestore();
  const resumeRef = db.collection(RESUMES_COLLECTION).doc(ACTIVE_RESUME_ID);
  const existing = await resumeRef.get();

  const payload = {
    resumeText,
    updatedAt: dbConfig.serverTimestamp(),
  };

  if (!existing.exists) {
    payload.createdAt = dbConfig.serverTimestamp();
  }

  await resumeRef.set(payload, { merge: true });
  const updated = await resumeRef.get();

  return mapResumeDoc(updated);
};

module.exports = {
  ACTIVE_RESUME_ID,
  getActiveResume,
  upsertActiveResume,
};
