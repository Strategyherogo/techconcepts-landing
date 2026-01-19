// Background service worker for TechConcepts VPN
// Handles proxy configuration

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'connect') {
    connectProxy(message.server)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'disconnect') {
    disconnectProxy()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'getStatus') {
    getProxyStatus()
      .then(status => sendResponse(status))
      .catch(error => sendResponse({ connected: false, error: error.message }));
    return true;
  }
});

// Connect to proxy server
async function connectProxy(server) {
  const config = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "socks5",
        host: server.host,
        port: server.port
      },
      bypassList: [
        "localhost",
        "127.0.0.1",
        "<local>"
      ]
    }
  };

  return new Promise((resolve, reject) => {
    chrome.proxy.settings.set(
      { value: config, scope: 'regular' },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // Update extension icon to show connected state
          updateIcon(true);
          resolve();
        }
      }
    );
  });
}

// Disconnect from proxy
async function disconnectProxy() {
  const config = {
    mode: "direct"
  };

  return new Promise((resolve, reject) => {
    chrome.proxy.settings.set(
      { value: config, scope: 'regular' },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // Update extension icon to show disconnected state
          updateIcon(false);
          resolve();
        }
      }
    );
  });
}

// Get current proxy status
async function getProxyStatus() {
  return new Promise((resolve) => {
    chrome.proxy.settings.get({ incognito: false }, (config) => {
      const isConnected = config.value && config.value.mode === 'fixed_servers';
      resolve({
        connected: isConnected,
        config: config.value
      });
    });
  });
}

// Update extension icon based on connection state
function updateIcon(connected) {
  const iconPrefix = connected ? 'icon-on' : 'icon-off';

  chrome.action.setIcon({
    path: {
      16: `icons/${iconPrefix}-16.png`,
      32: `icons/${iconPrefix}-32.png`,
      48: `icons/${iconPrefix}-48.png`,
      128: `icons/${iconPrefix}-128.png`
    }
  });

  // Update badge
  if (connected) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#4ade80' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Handle proxy errors
chrome.proxy.onProxyError.addListener((details) => {
  console.error('Proxy error:', details);

  // Notify popup if open
  chrome.runtime.sendMessage({
    type: 'proxyError',
    error: details.error
  }).catch(() => {
    // Popup not open, ignore
  });
});

// Restore state on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['isConnected']);
  if (!result.isConnected) {
    // Ensure proxy is cleared if we're not supposed to be connected
    await disconnectProxy();
  }
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First install - ensure clean state
    await disconnectProxy();
    await chrome.storage.local.clear();
  }
});
