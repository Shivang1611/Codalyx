// --- CONFIGURATION ---
// Change this to your production backend URL before publishing to the Chrome Web Store.
// e.g. const API_BASE_URL = 'https://api.yourdomain.com/api'
const API_BASE_URL = 'http://localhost:5000/api';
// -------------------

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const titleInput = document.getElementById('problemTitle');
  const errorDiv = document.getElementById('error');
  
  // We allow it to run on any Leetcode page now as a manual form, but auto-extraction only works dynamically.
  if (!tab.url.includes('leetcode.com')) {
    titleInput.value = 'Open on LeetCode to auto-extract';
  }

  // Extract from DOM
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractLeetcodeDetails,
  }, (results) => {
    if (chrome.runtime.lastError || !results || !results[0]) {
       titleInput.value = 'Manual tracking mode';
       return;
    }
    const { title, difficulty, tags, language } = results[0].result;
    
    if (title) titleInput.value = title;
    
    if (difficulty) {
       const diffSelect = document.getElementById('difficulty');
       if (difficulty.includes('Easy')) diffSelect.value = 'Easy';
       else if (difficulty.includes('Hard')) diffSelect.value = 'Hard';
       else diffSelect.value = 'Medium';
    }

    if (tags && tags.length) {
      document.getElementById('tags').value = tags.join(', ');
    }

    if (language) {
      document.getElementById('language').value = language;
    }
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const title = titleInput.value;
    const timeSpent = parseInt(document.getElementById('timeSpent').value || '0');
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(Boolean);
    const approach = document.getElementById('approach').value;
    const difficulty = document.getElementById('difficulty').value;
    const language = document.getElementById('language').value;
    const attempts = parseInt(document.getElementById('attempts').value || '1');
    
    if (!title || title === 'Not a LeetCode problem page') return;

    document.getElementById('saveBtn').innerText = 'Syncing to Codalyx...';
    document.getElementById('saveBtn').disabled = true;

    try {
      // Execute script on the local Codalyx app tab to grab the JWT token
      const token = await new Promise((resolve, reject) => {
         // Modify URL matching here to check for production domains as well when public.
         chrome.tabs.query({ url: "*://localhost:5174/*" }, (tabs) => {
             if (tabs.length === 0) {
                // If dashboard not open, we can't cleanly get localStorage from extension natively
                // Note for production: user should link token in a settings page.
                return reject(new Error('Please keep your Codalyx Dashboard open in another tab to sync.'));
             }
             chrome.scripting.executeScript({
                 target: { tabId: tabs[0].id },
                 function: () => {
                     const raw = localStorage.getItem('user');
                     return raw ? JSON.parse(raw).token : null;
                 }
             }, (res) => {
                 resolve(res?.[0]?.result);
             })
         });
      });

      if (!token) throw new Error('Codalyx session invalid. Please log in on the dashboard tab.');
      
      const payload = { title, difficulty, timeSpent, tags, approach, url: tab.url, language, attempts };

      const res = await fetch(`${API_BASE_URL}/profiles/extension/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.error || 'Failed to save');
      }

      document.getElementById('error').classList.add('hidden');
      document.getElementById('success').classList.remove('hidden');
      document.getElementById('saveBtn').innerText = 'Saved!';
      setTimeout(() => window.close(), 2000);

    } catch (e) {
      document.getElementById('error').innerText = e.message;
      document.getElementById('error').classList.remove('hidden');
      document.getElementById('saveBtn').innerText = 'Log to Dashboard';
      document.getElementById('saveBtn').disabled = false;
    }
  });
});

function extractLeetcodeDetails() {
  let title = document.title || '';
  if (title.includes(' - LeetCode')) {
    title = title.replace(' - LeetCode', '').replace(/^[\d\s\.\-]+/, '');
  }
  
  let diff = 'Medium';
  if (document.querySelector('.text-difficulty-easy, .text-success, [text="Easy"], .bg-olive')) diff = 'Easy';
  else if (document.querySelector('.text-difficulty-hard, .text-danger, [text="Hard"], .bg-pink')) diff = 'Hard';
  else if (document.querySelector('.text-difficulty-medium, .text-warning, [text="Medium"], .bg-yellow')) diff = 'Medium';

  let tags = [];
  try {
     const aTags = Array.from(document.querySelectorAll('a[href*="/tag/"]'));
     tags = [...new Set(aTags.map(a => a.textContent.trim()))];
  } catch(e) {}

  let language = '';
  try {
     // Attempt to grab language from the editor dropdown if present natively in LeetCode
     const langBtn = document.querySelector('button[id^="headlessui-listbox-button"]');
     if (langBtn && langBtn.textContent) {
       // usually has something like "C++ Auto"
       language = langBtn.textContent.split(' ')[0];
     } else {
       // fallback checks
       const monaco = document.querySelector('.monaco-editor');
       if (monaco) language = monaco.getAttribute('data-mode-id') || '';
     }
  } catch(e) {}

  return { title, difficulty: diff, tags, language };
}
