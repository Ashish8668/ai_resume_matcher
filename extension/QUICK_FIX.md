# Quick Fix: Button Not Showing

## The Problem
The button is being injected (console says "Button injected!") but it's not visible on the page.

## Solution: Run This in Console

**Copy and paste this entire code into the LinkedIn job page console (F12 → Console):**

```javascript
(function() {
  console.log('🔧 Quick fix: Injecting visible button...');
  
  // Remove any existing button
  const old = document.getElementById('resume-matcher-btn');
  if (old) old.remove();
  
  // Find Apply button
  const applyBtn = document.querySelector('button[aria-label*="Apply"], button[data-control-name*="apply"], .jobs-s-apply-button, button:has-text("Apply")');
  console.log('Apply button found:', applyBtn);
  
  // Create our button
  const btn = document.createElement('button');
  btn.id = 'resume-matcher-btn';
  btn.innerHTML = '🎯 Match Resume';
  btn.className = 'artdeco-button artdeco-button--2 artdeco-button--primary';
  
  // FORCE visibility with inline styles
  btn.style.cssText = `
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    margin-left: 10px !important;
    margin-top: 10px !important;
    padding: 12px 24px !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    z-index: 999999 !important;
    position: relative !important;
  `;
  
  // Click handler
  btn.onclick = function() {
    const jobData = {
      jobTitle: document.querySelector('h1')?.textContent || 'Unknown',
      companyName: document.querySelector('.jobs-details-top-card__company-name, .job-details-jobs-unified-top-card__company-name')?.textContent || 'Unknown',
      jobDescription: document.querySelector('.jobs-description-content__text, .jobs-box__html-content')?.textContent || ''
    };
    
    btn.disabled = true;
    btn.innerHTML = '⏳ Matching...';
    
    chrome.runtime.sendMessage({
      action: 'matchResume',
      jobData,
    }, (response) => {
      if (chrome.runtime.lastError) {
        alert('Error: ' + chrome.runtime.lastError.message);
        btn.disabled = false;
        btn.innerHTML = '🎯 Match Resume';
        return;
      }
      
      if (response && response.success) {
        chrome.storage.local.set({ lastMatchResult: response.result }, () => {
          alert('✅ Match complete! Click extension icon to view results.');
        });
      } else {
        alert('Error: ' + (response?.error || 'Unknown'));
      }
      btn.disabled = false;
      btn.innerHTML = '🎯 Match Resume';
    });
  };
  
  // Insert button
  if (applyBtn && applyBtn.parentElement) {
    // Insert right after Apply button
    applyBtn.parentElement.insertBefore(btn, applyBtn.nextSibling);
    console.log('✅ Button inserted after Apply button');
  } else {
    // Find any container with buttons
    const container = document.querySelector('.jobs-details-top-card__actions, .job-details-jobs-unified-top-card__actions, main');
    if (container) {
      container.insertBefore(btn, container.firstChild);
      console.log('✅ Button inserted at top of container');
    } else {
      // Last resort: top of page
      document.body.insertBefore(btn, document.body.firstChild);
      console.log('✅ Button inserted at top of page');
    }
  }
  
  // Verify it's visible
  setTimeout(() => {
    const rect = btn.getBoundingClientRect();
    console.log('Button position:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight
    });
    
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️  Button has zero size - might be hidden');
      btn.style.display = 'block';
      btn.style.width = 'auto';
      btn.style.height = 'auto';
    }
  }, 100);
  
  console.log('✅ Button should now be visible!');
})();
```

## After Running

1. **Look for the button** - It should appear near the "Apply" button
2. **Check console** - Look for position info
3. **Scroll the page** - Button might be above the fold

## If Still Not Visible

Run this to check button location:

```javascript
const btn = document.getElementById('resume-matcher-btn');
if (btn) {
  btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  console.log('Button location:', btn.getBoundingClientRect());
} else {
  console.log('Button not found in DOM');
}
```

## Next Steps

1. Reload extension: `chrome://extensions/` → Reload
2. Reload LinkedIn page: Press F5
3. Check if content script loads: Look for "🚀 AI Resume Matcher content script loaded" in console
4. If still not working, use the manual injection code above
