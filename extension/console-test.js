// PASTE THIS INTO LINKEDIN JOB PAGE CONSOLE (F12 → Console tab)
// This will manually inject the Match Resume button

(function() {
  console.log('🧪 Manual button injection test...');
  
  // Remove old button if exists
  const oldBtn = document.getElementById('resume-matcher-btn');
  if (oldBtn) {
    oldBtn.remove();
    console.log('🗑️  Removed old button');
  }
  
  // Create button
  const button = document.createElement('button');
  button.id = 'resume-matcher-btn';
  button.innerHTML = '🎯 Match Resume';
  button.className = 'artdeco-button artdeco-button--2 artdeco-button--primary';
  button.style.marginLeft = '10px';
  button.style.marginTop = '10px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '10000';
  
  // Extract job data function
  function extractJobData() {
    const jobTitle = document.querySelector('.jobs-details-top-card__job-title, h1')?.textContent?.trim() || 'Unknown Position';
    const companyName = document.querySelector('.jobs-details-top-card__company-name a, .job-details-jobs-unified-top-card__company-name a')?.textContent?.trim() || 'Unknown Company';
    const jobDescription = document.querySelector('.jobs-description-content__text, .jobs-box__html-content')?.textContent?.trim() || 
                          document.querySelector('.jobs-description-content__text, .jobs-box__html-content')?.innerText?.trim() || '';
    
    console.log('📄 Extracted job data:', { jobTitle, companyName, descLength: jobDescription.length });
    return { jobTitle, companyName, jobDescription, url: window.location.href };
  }
  
  // Button click handler
  button.addEventListener('click', async () => {
    console.log('🖱️  Button clicked!');
    const jobData = extractJobData();
    
    if (!jobData.jobDescription) {
      alert('❌ Could not extract job description. Please ensure you are on a LinkedIn job posting page.');
      return;
    }
    
    button.disabled = true;
    button.innerHTML = '⏳ Matching...';
    
    try {
      // Send message to extension background script
      chrome.runtime.sendMessage({
        action: 'matchResume',
        jobData,
      }, (response) => {
        console.log('📨 Response from background:', response);
        
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }
        
        if (response && response.success) {
          console.log('✅ Match successful!', response.result);
          // Store result
          chrome.storage.local.set({ lastMatchResult: response.result }, () => {
            // Try to open popup
            chrome.action.openPopup().catch(() => {
              alert('✅ Match complete! Click the extension icon to view results.');
            });
          });
        } else {
          alert('❌ Error: ' + (response?.error || 'Unknown error'));
          console.error('Error response:', response);
        }
        
        button.disabled = false;
        button.innerHTML = '🎯 Match Resume';
      });
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
      button.disabled = false;
      button.innerHTML = '🎯 Match Resume';
    }
  });
  
  // Find container to inject button
  const containers = [
    document.querySelector('.jobs-s-apply__application-link')?.parentElement,
    document.querySelector('.jobs-details-top-card__actions'),
    document.querySelector('.jobs-apply-button')?.parentElement,
    document.querySelector('.job-details-jobs-unified-top-card__actions'),
    document.querySelector('main')?.querySelector('.artdeco-button')?.parentElement,
  ].filter(c => c !== null);
  
  console.log('🔍 Found containers:', containers.length);
  
  if (containers.length > 0) {
    containers[0].appendChild(button);
    console.log('✅ Button injected successfully!');
  } else {
    // Fallback: inject at top of page
    const main = document.querySelector('main') || document.body;
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.textAlign = 'center';
    wrapper.appendChild(button);
    main.insertBefore(wrapper, main.firstChild);
    console.log('⚠️  Injected at top of page (container not found)');
  }
})();
