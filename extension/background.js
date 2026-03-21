/**
 * Background Service Worker
 * Handles message passing for resume matching
 */

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'matchResume') {
    // Make API call
    (async () => {
      try {
        const response = await fetch('http://localhost:5000/api/match', {
          method: 'POST',
          headers: {
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
