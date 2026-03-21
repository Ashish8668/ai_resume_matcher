/**
 * API Client for Backend
 */

const API_BASE_URL = 'http://localhost:5000';

// Upload resume PDF
async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: 'POST',
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
  const response = await fetch(`${API_BASE_URL}/api/resume`, {
    method: 'GET',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get resume');
  }
  
  return data;
}

// Match resume with job
async function matchResume(jobData) {
  const response = await fetch(`${API_BASE_URL}/api/match`, {
    method: 'POST',
    headers: {
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
