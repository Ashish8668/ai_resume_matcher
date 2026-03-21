/**
 * Popup UI Logic
 * Handles resume upload and displays match results
 */

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// DOM Elements
const uploadBtn = document.getElementById('uploadBtn');
const resumeFile = document.getElementById('resumeFile');
const uploadStatus = document.getElementById('uploadStatus');
const uploadSection = document.getElementById('uploadSection');
const matchSection = document.getElementById('matchSection');
const matchResults = document.getElementById('matchResults');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Check if resume exists
  await checkResumeStatus();
  
  // Check for last match results
  await loadLastMatchResults();
  
  // Setup upload button
  uploadBtn.addEventListener('click', () => {
    resumeFile.click();
  });
  
  resumeFile.addEventListener('change', handleFileUpload);
});

// Check resume status
async function checkResumeStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.resume) {
        uploadStatus.textContent = '✅ Resume uploaded';
        uploadStatus.className = 'upload-status success';
      }
    }
  } catch (error) {
    // Resume not found or error - that's okay
    console.log('No resume found');
  }
}

// Handle file upload
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.type !== 'application/pdf') {
    showError('Please select a PDF file');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showError('File too large. Maximum size is 5MB.');
    return;
  }
  
  uploadBtn.disabled = true;
  uploadBtn.textContent = '⏳ Uploading...';
  uploadStatus.textContent = '';
  hideError();
  showLoading();
  
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      uploadStatus.textContent = '✅ Resume uploaded successfully!';
      uploadStatus.className = 'upload-status success';
      uploadBtn.textContent = '📤 Upload Resume PDF';
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    showError('Upload failed: ' + error.message);
    uploadStatus.textContent = '❌ Upload failed';
    uploadStatus.className = 'upload-status error';
  } finally {
    uploadBtn.disabled = false;
    hideLoading();
    resumeFile.value = ''; // Reset file input
  }
}

// Load last match results
async function loadLastMatchResults() {
  try {
    chrome.storage.local.get(['lastMatchResult'], (result) => {
      if (result.lastMatchResult) {
        displayMatchResults(result.lastMatchResult);
      }
    });
  } catch (error) {
    console.error('Failed to load match results:', error);
  }
}

// Display match results
function displayMatchResults(result) {
  if (!result || !result.match) {
    return;
  }
  
  const match = result.match;
  
  let html = `
    <div class="match-score">
      <div class="score-value">${match.atsScore || 0}%</div>
      <div class="score-label">ATS Match Score</div>
    </div>
  `;
  
  // Missing Skills
  if (match.missingSkills && match.missingSkills.length > 0) {
    html += `
      <div class="results-section">
        <h3>❌ Missing Skills</h3>
        <div class="skills-list">
    `;
    match.missingSkills.slice(0, 10).forEach(skill => {
      const skillName = typeof skill === 'string' ? skill : skill.skill;
      html += `<span class="skill-badge skill-missing">${skillName}</span>`;
    });
    html += `</div></div>`;
  }
  
  // Matched Skills
  if (match.matchedSkills && match.matchedSkills.length > 0) {
    html += `
      <div class="results-section">
        <h3>✅ Matched Skills</h3>
        <div class="skills-list">
    `;
    match.matchedSkills.slice(0, 10).forEach(skill => {
      const skillName = typeof skill === 'string' ? skill : skill.skill;
      html += `<span class="skill-badge skill-matched">${skillName}</span>`;
    });
    html += `</div></div>`;
  }
  
  // Suggestions
  if (match.suggestions) {
    const suggestions = match.suggestions;
    
    if (suggestions.keywordSuggestions && suggestions.keywordSuggestions.length > 0) {
      html += `
        <div class="results-section">
          <h3>💡 Keyword Suggestions</h3>
          <ul class="suggestions-list">
      `;
      suggestions.keywordSuggestions.slice(0, 5).forEach(suggestion => {
        html += `<li class="suggestion-item">${suggestion}</li>`;
      });
      html += `</ul></div>`;
    }
    
    if (suggestions.bulletSuggestions && suggestions.bulletSuggestions.length > 0) {
      html += `
        <div class="results-section">
          <h3>📝 Bullet Point Suggestions</h3>
          <ul class="suggestions-list">
      `;
      suggestions.bulletSuggestions.slice(0, 5).forEach(suggestion => {
        html += `<li class="suggestion-item">${suggestion}</li>`;
      });
      html += `</ul></div>`;
    }
  }
  
  // Project Ideas
  if (match.projectIdeas && match.projectIdeas.length > 0) {
    html += `
      <div class="results-section">
        <h3>🚀 Project Ideas</h3>
    `;
    match.projectIdeas.slice(0, 3).forEach(project => {
      html += `
        <div class="project-card">
          <div class="project-title">${project.title}</div>
          <div class="project-description">${project.description}</div>
          <div class="project-meta">
            <span>Difficulty: ${project.difficulty}</span>
            <span>Time: ${project.estimatedTime}</span>
          </div>
          <div class="project-skills">
      `;
      if (project.skills) {
        project.skills.forEach(skill => {
          html += `<span class="project-skill">${skill}</span>`;
        });
      }
      html += `</div></div>`;
    });
    html += `</div>`;
  }
  
  matchResults.innerHTML = html;
  matchSection.style.display = 'block';
}

// Show/hide loading
function showLoading() {
  loadingState.style.display = 'block';
  uploadSection.style.display = 'none';
  matchSection.style.display = 'none';
}

function hideLoading() {
  loadingState.style.display = 'none';
  uploadSection.style.display = 'block';
}

// Show/hide error
function showError(message) {
  errorMessage.textContent = message;
  errorState.style.display = 'block';
}

function hideError() {
  errorState.style.display = 'none';
}
