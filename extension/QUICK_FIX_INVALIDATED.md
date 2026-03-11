# Quick Fix: Extension Context Invalidated

## What Happened?

"Extension context invalidated" means the extension was reloaded while you were using it. This is normal during development.

## ✅ Quick Fix (3 Steps)

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "AI Resume Matcher"
3. Click the **reload icon** (🔄 circular arrow)

### Step 2: Reload LinkedIn Page
1. Go back to LinkedIn job page
2. Press **F5** (or **Ctrl+R**)
3. Page will reload with fresh content scripts

### Step 3: Test Again
1. Button should appear
2. Click "🎯 Match Resume"
3. Should work now!

## Why This Happens

- Extension files were modified
- Extension was reloaded manually
- Chrome automatically reloaded extension
- Service worker restarted

## Prevention

- **Don't reload extension while testing** - Reload page instead
- **After reloading extension** - Always reload the page too
- **Check console** - Look for errors before testing

## Still Not Working?

### Option 1: Remove and Re-add
1. `chrome://extensions/` → Remove extension
2. Click "Load unpacked"
3. Select `extension` folder
4. Reload LinkedIn page

### Option 2: Hard Reload
1. Press **Ctrl+Shift+R** (hard reload)
2. Clears cache and reloads everything

### Option 3: Check Errors
1. `chrome://extensions/` → Click "Errors" button
2. Fix any errors shown
3. Reload extension and page

## The Fix I Added

The code now:
- ✅ Detects invalidated context
- ✅ Shows helpful error message
- ✅ Tells you to reload the page
- ✅ Handles errors gracefully

**Just reload the page (F5) and it will work!**
