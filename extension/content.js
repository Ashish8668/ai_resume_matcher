/**
 * Content Script for LinkedIn Job Pages
 * Extracts job data and injects "Match Resume" button
 */

console.log('📦 Content script file loaded');

// Check if we're on a LinkedIn job page
function isLinkedInJobPage() {
  const url = window.location.href;
  const isJobPage = url.includes('linkedin.com/jobs/view/') ||
                    url.includes('linkedin.com/jobs/search') ||
                    url.includes('/jobs/view/') ||
                    url.includes('linkedin.com/jobs/collections') ||
                    (url.includes('linkedin.com/jobs') && url.includes('currentJobId'));
  console.log('🔍 URL check:', url, '→ Is job page:', isJobPage);
  return isJobPage;
}

// Extract job data
function extractJobData() {
  try {
    // Job title
    let jobTitle = '';
    const titleSelectors = [
      '.jobs-details-top-card__job-title',
      '.job-details-jobs-unified-top-card__job-title',
      'h1[data-test-id="job-title"]',
    ];
    
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        jobTitle = element.textContent.trim();
        break;
      }
    }
    
    // Company name
    let companyName = '';
    const companySelectors = [
      '.jobs-details-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name a',
      'a[data-test-id="job-company-name"]',
    ];
    
    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        companyName = element.textContent.trim();
        break;
      }
    }
    
    // Job description
    let jobDescription = '';
    const descriptionSelectors = [
      '.jobs-description-content__text',
      '.jobs-box__html-content',
      '[data-test-id="job-description"]',
    ];
    
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        jobDescription = element.textContent.trim() || element.innerText.trim();
        break;
      }
    }
    
    return {
      jobTitle: jobTitle || 'Unknown Position',
      companyName: companyName || 'Unknown Company',
      jobDescription: jobDescription || '',
      url: window.location.href,
    };
  } catch (error) {
    console.error('Error extracting job data:', error);
    return null;
  }
}

// Inject match button
function injectMatchButton() {
  // Check if button already exists
  const existingBtn = document.getElementById('resume-matcher-btn');
  if (existingBtn) {
    console.log('✅ Match Resume button already exists');
    // Make sure it's visible
    existingBtn.style.display = 'block';
    existingBtn.style.visibility = 'visible';
    existingBtn.style.opacity = '1';
    return;
  }
  
  console.log('🔍 Looking for LinkedIn actions container...');
  
  // Try multiple selectors to find the actions container (updated for current LinkedIn layout)
  const possibleSelectors = [
    // New LinkedIn layout selectors
    'button[aria-label*="Apply"]',
    'button[data-control-name="jobdetails_topcard_inapply"]',
    '.jobs-s-apply-button',
    '.jobs-s-apply__application-link',
    '.jobs-details-top-card__actions',
    '.job-details-jobs-unified-top-card__actions',
    '[data-test-id="apply-button"]',
    // Fallback: find any apply button
    'button:has-text("Apply")',
  ];
  
  let actionsContainer = null;
  let applyButton = null;
  
  // Try to find the Apply button first
  for (const selector of possibleSelectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`✅ Found element with selector: ${selector}`);
        applyButton = element;
        // Try to find its parent container
        actionsContainer = element.parentElement || 
                          element.closest('.jobs-details-top-card__actions') ||
                          element.closest('.job-details-jobs-unified-top-card__actions') ||
                          element.closest('div[class*="actions"]') ||
                          element.closest('div');
        if (actionsContainer) {
          break;
        }
      }
    } catch (e) {
      // Skip invalid selectors
      continue;
    }
  }
  
  // If still not found, try to find container near job title
  if (!actionsContainer) {
    const jobTitle = document.querySelector('h1.jobs-details-top-card__job-title, h1[data-test-id="job-title"]');
    if (jobTitle) {
      const parent = jobTitle.closest('div');
      if (parent) {
        // Look for button container in the same section
        actionsContainer = parent.querySelector('.artdeco-button')?.parentElement ||
                          parent.querySelector('div[class*="actions"]') ||
                          parent;
      }
    }
  }
  
  // Last resort: find main content area
  if (!actionsContainer) {
    const mainContent = document.querySelector('main, [role="main"], .jobs-details__main-content');
    if (mainContent) {
      // Create a wrapper div at the top
      const wrapper = document.createElement('div');
      wrapper.style.padding = '20px';
      wrapper.style.marginBottom = '20px';
      wrapper.style.borderBottom = '1px solid #e0e0e0';
      mainContent.insertBefore(wrapper, mainContent.firstChild);
      actionsContainer = wrapper;
    } else {
      actionsContainer = document.body;
    }
  }
  
  if (!actionsContainer) {
    console.warn('⚠️  Could not find container, retrying in 1 second...');
    setTimeout(injectMatchButton, 1000);
    return;
  }
  
  console.log('✅ Found container, injecting button...', actionsContainer);
  
  const button = document.createElement('button');
  button.id = 'resume-matcher-btn';
  button.className = 'artdeco-button artdeco-button--2 artdeco-button--primary';
  button.innerHTML = '🎯 Match Resume';
  
  // Strong styling to ensure visibility
  button.style.cssText = `
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    z-index: 99999;
    position: relative;
    display: inline-block;
    visibility: visible !important;
    opacity: 1 !important;
    background: linear-gradient(135deg, #0a66c2 0%, #004182 100%) !important;
    color: white !important;
    border: none !important;
    padding: 12px 24px !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    font-size: 14px !important;
  `;
  
  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.4)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = 'none';
  });
  
  button.addEventListener('click', async () => {
    const jobData = extractJobData();
    
    if (!jobData || !jobData.jobDescription) {
      alert('Could not extract job description. Please ensure you are on a LinkedIn job posting page.');
      return;
    }
    
    button.disabled = true;
    button.innerHTML = '⏳ Matching...';
    
    try {
      // Check if extension context is still valid
      if (!chrome.runtime || !chrome.runtime.id) {
        alert('⚠️ Extension context invalidated. Please reload the page.');
        button.disabled = false;
        button.innerHTML = '🎯 Match Resume';
        return;
      }
      
      chrome.runtime.sendMessage({
        action: 'matchResume',
        jobData,
      }, (response) => {
        // Handle extension context invalidated error
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          if (errorMsg.includes('Extension context invalidated') || 
              errorMsg.includes('message port closed')) {
            alert('⚠️ Extension was reloaded. Please refresh this page (F5) and try again.');
            button.disabled = false;
            button.innerHTML = '🎯 Match Resume';
            return;
          }
          throw new Error(errorMsg);
        }
        
        if (response && response.success) {
          // Store result and auto-open results window
          chrome.storage.local.set({ lastMatchResult: response.result }, () => {
            if (chrome.runtime.lastError) {
              console.error('Storage error:', chrome.runtime.lastError);
            }
            chrome.runtime.sendMessage({ action: 'openResultsPopup' }, (openResp) => {
              if (chrome.runtime.lastError || !openResp?.success) {
                // Fallback to default popup API
                chrome.action.openPopup().catch(() => {
                  alert('Match complete! Click the extension icon to view results.');
                });
              }
            });
          });
        } else {
          alert('Error: ' + (response?.error || 'Unknown error'));
        }
        
        button.disabled = false;
        button.innerHTML = '🎯 Match Resume';
      });
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('Extension context invalidated')) {
        alert('⚠️ Extension was reloaded. Please refresh this page (F5) and try again.');
      } else {
        alert('Error: ' + error.message);
      }
      button.disabled = false;
      button.innerHTML = '🎯 Match Resume';
    }
  });
  
  // Insert button right after Apply button if found, otherwise append to container
  if (applyButton && applyButton.parentElement) {
    // Insert right after Apply button
    applyButton.parentElement.insertBefore(button, applyButton.nextSibling);
    console.log('✅ Button inserted after Apply button');
  } else {
    // Append to container
    actionsContainer.appendChild(button);
    console.log('✅ Button appended to container');
  }
  
  // Verify button is visible
  setTimeout(() => {
    const btn = document.getElementById('resume-matcher-btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      console.log('✅ Button position:', { 
        top: rect.top, 
        left: rect.left, 
        visible: rect.width > 0 && rect.height > 0,
        display: window.getComputedStyle(btn).display,
        visibility: window.getComputedStyle(btn).visibility
      });
      
      // Force visibility
      btn.style.display = 'inline-block';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
    } else {
      console.error('❌ Button was removed immediately after injection!');
    }
  }, 100);
  
  console.log('✅ Match Resume button injected successfully!');
}

// Note: Content scripts run in isolated world, so functions aren't directly accessible from page console
// Use the manual injection code from TEST_BUTTON.md if needed

// Initialize on LinkedIn job pages
function initContentScript() {
  console.log('🚀 AI Resume Matcher content script loaded');
  console.log('📍 Current URL:', window.location.href);
  console.log('🔍 Checking if on LinkedIn job page...');
  
  // Always expose the function for manual testing
  if (typeof window !== 'undefined') {
    // Try to expose function directly (may not work due to isolated world)
    try {
      window.injectResumeMatcherButton = injectMatchButton;
    } catch (e) {
      console.log('⚠️  Could not expose function directly (isolated world)');
    }
  }
  
  if (isLinkedInJobPage()) {
    console.log('✅ On LinkedIn job page, injecting button...');
    
    // Try immediate injection
    injectMatchButton();
    
    // Also try after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, injecting button...');
        setTimeout(injectMatchButton, 500);
      });
    } else {
      setTimeout(injectMatchButton, 500);
    }
    
    // Watch for SPA navigation and DOM changes (LinkedIn uses React)
    let lastUrl = location.href;
    
    // Watch for URL changes
    const urlObserver = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔄 URL changed:', currentUrl);
        lastUrl = currentUrl;
        // Remove old button if exists
        const oldButton = document.getElementById('resume-matcher-btn');
        if (oldButton) {
          oldButton.remove();
        }
        if (isLinkedInJobPage()) {
          setTimeout(injectMatchButton, 1000);
        }
      }
    });
    
    // Watch for button being removed by React
    const buttonObserver = new MutationObserver((mutations) => {
      const button = document.getElementById('resume-matcher-btn');
      if (!button && isLinkedInJobPage()) {
        console.log('⚠️  Button was removed, reinjecting...');
        setTimeout(injectMatchButton, 500);
      }
    });
    
    // Observe body for changes
    urlObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Observe for button removal
    buttonObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check periodically (LinkedIn React can be aggressive)
    setInterval(() => {
      if (isLinkedInJobPage() && !document.getElementById('resume-matcher-btn')) {
        console.log('🔄 Periodic check: Button missing, reinjecting...');
        injectMatchButton();
      }
    }, 3000); // Check every 3 seconds
    
    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
      console.log('⬅️  Popstate event, reinjecting button...');
      setTimeout(() => {
        const oldButton = document.getElementById('resume-matcher-btn');
        if (oldButton) oldButton.remove();
        injectMatchButton();
      }, 500);
    });
    
  } else {
    console.log('ℹ️  Not on LinkedIn job page');
  }
}

// Run immediately
initContentScript();

// Also run when page loads (for direct navigation)
if (document.readyState === 'complete') {
  initContentScript();
} else {
  window.addEventListener('load', initContentScript);
}

