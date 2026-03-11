/**
 * UUID Management Utility
 * Generates and stores UUID v4 in chrome.storage.local
 */

// UUID v4 generator
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
        reject(new Error(chrome.runtime.lastError.lastError));
        return;
      }
      
      if (result.userUUID) {
        resolve(result.userUUID);
        return;
      }
      
      const newUUID = generateUUID();
      chrome.storage.local.set({ userUUID: newUUID }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
          return;
        }
        console.log('✅ Generated UUID:', newUUID);
        resolve(newUUID);
      });
    });
  });
}

// Get UUID (may return null)
async function getUUID() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['userUUID'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
        return;
      }
      resolve(result.userUUID || null);
    });
  });
}
