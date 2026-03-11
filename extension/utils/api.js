/**
 * API Client for Backend
 * All requests include X-User-UUID header
 */

const API_BASE_URL = 'http://localhost:5000';

// Load UUID utility
async function loadUUIDUtil() {
  const script = await import(chrome.runtime.getURL('utils/uuid.js'));
  return script;
}

// Upload resume PDF
async function uploadResume(file) {
  const uuidUtil = await loadUUIDUtil();
  const uuid = await uuidUtil.getOrCreateUUID();
  
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: 'POST',
    headers: {
      'X-User-UUID': uuid,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload resume');
  }
  
  return data;
}

// Get resume
async function getResume() {
  const uuidUtil = await loadUUIDUtil();
  const uuid = await uuidUtil.getOrCreateUUID();
  
  const response = await fetch(`${API_BASE_URL}/api/resume`, {
    method: 'GET',
    headers: {
      'X-User-UUID': uuid,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get resume');
  }
  
  return data;
}

// Match resume with job
async function matchResume(jobData) {
  const uuidUtil = await loadUUIDUtil();
  const uuid = await uuidUtil.getOrCreateUUID();
  
  const response = await fetch(`${API_BASE_URL}/api/match`, {
    method: 'POST',
    headers: {
      'X-User-UUID': uuid,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to match resume');
  }
  
  return data;
}
