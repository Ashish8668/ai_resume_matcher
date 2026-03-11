# Debugging the Match Resume Button

## Check if Content Script is Running

1. **Open LinkedIn job page** (e.g., `https://www.linkedin.com/jobs/view/...`)

2. **Open Chrome DevTools** (F12)

3. **Go to Console tab**

4. **Look for these messages:**
   - `🚀 AI Resume Matcher content script loaded`
   - `✅ On LinkedIn job page, injecting button...`
   - `✅ Found actions container, injecting button...`

## Manual Test in Console

If the button doesn't appear, try this in the console:

```javascript
// Check if we're on a job page
console.log('URL:', window.location.href);
console.log('Is job page:', window.location.href.includes('linkedin.com/jobs/view/'));

// Try to find the actions container manually
const containers = [
  document.querySelector('.jobs-s-apply__application-link')?.parentElement,
  document.querySelector('.jobs-details-top-card__actions'),
  document.querySelector('.jobs-apply-button')?.parentElement,
];
console.log('Found containers:', containers.filter(c => c !== null));

// Manually inject button
const btn = document.createElement('button');
btn.id = 'resume-matcher-btn';
btn.innerHTML = '🎯 Match Resume';
btn.className = 'artdeco-button artdeco-button--2 artdeco-button--primary';
btn.style.marginLeft = '10px';
btn.onclick = () => alert('Button clicked!');
document.querySelector('.jobs-details-top-card__actions')?.appendChild(btn);
```

## Check Content Script Injection

1. Go to `chrome://extensions/`
2. Find "AI Resume Matcher"
3. Click "service worker" (or "background page")
4. Check console for errors

## Common Issues

### Issue 1: Content Script Not Loading
**Symptoms:** No console messages
**Fix:** 
- Reload extension in `chrome://extensions/`
- Check manifest.json matches correct
- Verify `host_permissions` includes LinkedIn

### Issue 2: Button Container Not Found
**Symptoms:** Console shows "Could not find actions container"
**Fix:**
- LinkedIn may have changed their DOM structure
- Check current selectors in browser console
- Update selectors in `content.js`

### Issue 3: Button Appears But Doesn't Work
**Symptoms:** Button visible but click does nothing
**Fix:**
- Check background.js console for errors
- Verify API URL is correct
- Check network tab for API calls

## Testing Steps

1. **Reload Extension**
   ```
   chrome://extensions/ → Reload extension
   ```

2. **Reload LinkedIn Page**
   ```
   Press F5 or Ctrl+R
   ```

3. **Check Console**
   ```
   F12 → Console tab → Look for messages
   ```

4. **Test Button Injection**
   ```
   Console → Run manual test code above
   ```

5. **Check Network Requests**
   ```
   F12 → Network tab → Click button → Check for API calls
   ```

## LinkedIn Selectors (Current)

The script tries these selectors:
- `.jobs-s-apply__application-link`
- `.jobs-details-top-card__actions`
- `.jobs-apply-button`
- `[data-test-id="apply-button"]`

If LinkedIn changes their structure, update these in `content.js`.
