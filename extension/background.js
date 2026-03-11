/**
 * Background Service Worker
 * Handles UUID initialization and message passing
 */

// UUID generation function (inline)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create UUID
async function getOrCreateUUID() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['userUUID'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      if (result.userUUID) {
        resolve(result.userUUID);
        return;
      }
      
      const newUUID = generateUUID();
      chrome.storage.local.set({ userUUID: newUUID }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        console.log('✅ Generated and stored UUID:', newUUID);
        resolve(newUUID);
      });
    });
  });
}

// Initialize UUID on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    try {
      const uuid = await getOrCreateUUID();
      console.log('✅ Extension installed. UUID:', uuid);
    } catch (error) {
      console.error('❌ Failed to initialize UUID:', error);
    }
  }
});

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'matchResume') {
    // Make API call
    (async () => {
      try {
        const uuid = await getOrCreateUUID();
        
        const response = await fetch('http://localhost:5000/api/match', {
          method: 'POST',
          headers: {
            'X-User-UUID': uuid,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.jobData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Match failed');
        }
        
        sendResponse({ success: true, result: data });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    
    return true; // Async response
  }
  
  return false;
});

console.log('Background service worker loaded');
