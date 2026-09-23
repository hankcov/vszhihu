// VSCode-Zhihu Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('[VSCode-Zhihu] Extension installed successfully.');
  
  // Set initial settings if not present
  chrome.storage.sync.get(['enabled', 'theme', 'codeViewMode', 'fontSize', 'bossKeyShortcut', 'customBossCode', 'sponsorLink', 'isPro', 'licenseKey'], (res) => {
    const defaults = {
      enabled: true,
      theme: 'dark-plus', // dark-plus (free default)
      codeViewMode: 'code',
      fontSize: 15,
      bossKeyShortcut: 'Alt+V',
      customBossCode: '',
      sponsorLink: 'https://ifdian.net/a/7675a',
      isPro: false,
      licenseKey: ''
    };

    let needsUpdate = false;
    for (const key in defaults) {
      if (res[key] === undefined) {
        res[key] = defaults[key];
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      chrome.storage.sync.set(res);
    }
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(null, (items) => {
      sendResponse(items);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'saveSetting') {
    chrome.storage.sync.set({ [request.key]: request.value }, () => {
      sendResponse({ status: 'ok' });
    });
    return true;
  }

  if (request.action === 'fetchUrl') {
    fetch(request.url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      credentials: 'include',
      redirect: 'follow'
    })
      .then(async res => {
        const data = await res.text();
        return {
          ok: res.ok,
          status: res.status,
          finalUrl: res.url || request.url,
          length: data.length,
          data
        };
      })
      .then(info => {
        if (!info.ok) {
          sendResponse({ success: false, error: 'HTTP ' + info.status, finalUrl: info.finalUrl, length: info.length });
          return;
        }
        sendResponse({ success: true, data: info.data, finalUrl: info.finalUrl, length: info.length });
      })
      .catch(err => sendResponse({ success: false, error: err.toString() }));
    return true; // Keep channel open for async response
  }
});
