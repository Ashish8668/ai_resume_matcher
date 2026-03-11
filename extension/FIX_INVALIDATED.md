# Fix: Extension Context Invalidated Error

## What This Error Means

"Extension context invalidated" happens when:
- Extension is reloaded while content scripts are running
- Service worker restarts
- Extension files are modified

## Quick Fix

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "AI Resume Matcher"
3. Click the **reload icon** (circular arrow)
4. Wait for it to reload

### Step 2: Reload LinkedIn Page
1. Go back to LinkedIn job page
2. Press **F5** or **Ctrl+R** to reload the page
3. This will inject fresh content scripts

### Step 3: Verify It Works
1. Open Console (F12)
2. Look for: `🚀 AI Resume Matcher content script loaded`
3. Button should appear

## If Still Not Working

### Option 1: Remove and Re-add Extension
1. Go to `chrome://extensions/`
2. Click **Remove** on "AI Resume Matcher"
3. Click **Load unpacked**
4. Select the `extension` folder again
5. Reload LinkedIn page

### Option 2: Clear Extension Storage
1. Open DevTools (F12) on LinkedIn page
2. Go to Console
3. Run:
```javascript
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  location.reload();
});
```

### Option 3: Check for Errors
1. Go to `chrome://extensions/`
2. Find "AI Resume Matcher"
3. Click **"Errors"** button (if visible)
4. Check for any syntax errors
5. Fix any errors shown

## Prevention

To avoid this error:
- Don't reload extension while testing
- Reload page after reloading extension
- Check console for errors before testing

## Common Causes

1. **Syntax Error in content.js**
   - Check console for errors
   - Fix any JavaScript errors

2. **Manifest.json Issues**
   - Verify manifest.json is valid JSON
   - Check content_scripts matches are correct

3. **Service Worker Restart**
   - Background script restarted
   - Just reload the page

## Still Having Issues?

Share:
1. Console errors (F12 → Console)
2. Extension errors (`chrome://extensions/` → Errors)
3. What you see when you reload
