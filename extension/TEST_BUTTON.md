# Testing the Match Resume Button

## Quick Test Steps

### 1. Reload Extension
- Go to `chrome://extensions/`
- Find "AI Resume Matcher"
- Click the **reload icon** (circular arrow)

### 2. Go to LinkedIn Job Page
- Navigate to: `https://www.linkedin.com/jobs/view/...` (any job posting)
- Or search for jobs and click on one

### 3. Open Console
- Press **F12** to open DevTools
- Go to **Console** tab
- Look for these messages:
  ```
  🚀 AI Resume Matcher content script loaded
  📍 Current URL: https://www.linkedin.com/jobs/view/...
  ✅ On LinkedIn job page, injecting button...
  ```

### 4. Check if Button Appeared
- Look near the "Easy Apply" or "Apply" button
- You should see a **"🎯 Match Resume"** button

## Manual Injection (If Button Doesn't Appear)

If the button doesn't appear automatically, try this in the console:

```javascript
// Method 1: Direct injection (if content script loaded)
(function() {
  const btn = document.createElement('button');
  btn.id = 'resume-matcher-btn';
  btn.innerHTML = '🎯 Match Resume';
  btn.className = 'artdeco-button artdeco-button--2 artdeco-button--primary';
  btn.style.marginLeft = '10px';
  btn.style.marginTop = '10px';
  btn.style.cursor = 'pointer';
  btn.onclick = function() {
    alert('Button clicked! Testing...');
    // Extract job data
    const jobDesc = document.querySelector('.jobs-description-content__text')?.textContent || 
                    document.querySelector('.jobs-box__html-content')?.textContent || '';
    console.log('Job description length:', jobDesc.length);
    
    // Send message to background
    chrome.runtime.sendMessage({
      action: 'matchResume',
      jobData: {
        jobTitle: document.querySelector('h1')?.textContent || 'Unknown',
        companyName: document.querySelector('.jobs-details-top-card__company-name')?.textContent || 'Unknown',
        jobDescription: jobDesc
      }
    }, (response) => {
      console.log('Response:', response);
      if (response && response.success) {
        alert('Match successful! Check extension popup.');
      } else {
        alert('Error: ' + (response?.error || 'Unknown error'));
      }
    });
  };
  
  // Try to find container
  const container = document.querySelector('.jobs-s-apply__application-link')?.parentElement ||
                    document.querySelector('.jobs-details-top-card__actions') ||
                    document.querySelector('.jobs-apply-button')?.parentElement ||
                    document.body;
  
  container.appendChild(btn);
  console.log('✅ Button injected manually!');
})();
```

## Debug Checklist

- [ ] Extension is loaded and enabled
- [ ] You're on a LinkedIn job page (URL contains `/jobs/view/`)
- [ ] Console shows content script loaded message
- [ ] No errors in console (red text)
- [ ] Backend server is running on port 5000
- [ ] Resume is uploaded via extension popup

## Common Issues

### Issue: No console messages
**Solution:** Content script not loading
- Check manifest.json matches LinkedIn URLs
- Reload extension
- Check for errors in `chrome://extensions/` → "Errors" button

### Issue: Console messages but no button
**Solution:** Selectors not matching LinkedIn's DOM
- LinkedIn may have changed their HTML structure
- Try manual injection code above
- Check what selectors work in console:
  ```javascript
  console.log('Apply link:', document.querySelector('.jobs-s-apply__application-link'));
  console.log('Actions:', document.querySelector('.jobs-details-top-card__actions'));
  ```

### Issue: Button appears but doesn't work
**Solution:** Check background script
- Go to `chrome://extensions/` → Click "service worker" link
- Check console for errors
- Verify API URL is correct in background.js

## Get Help

If still not working, share:
1. Console messages (copy/paste)
2. Current LinkedIn URL
3. Any error messages
4. Screenshot of the page
