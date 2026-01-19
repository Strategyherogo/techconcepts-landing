// DOM Elements
const statusIcon = document.getElementById('statusIcon');
const statusEmoji = document.getElementById('statusEmoji');
const statusLabel = document.getElementById('statusLabel');
const connectBtn = document.getElementById('connectBtn');
const serverSelect = document.getElementById('serverSelect');
const connectionInfo = document.getElementById('connectionInfo');
const errorMsg = document.getElementById('errorMsg');
const infoServer = document.getElementById('infoServer');
const infoIp = document.getElementById('infoIp');
const infoTime = document.getElementById('infoTime');

// Server configurations - LIVE SERVERS
const SERVERS = {
  uk: {
    name: '🇬🇧 United Kingdom (London)',
    host: '167.71.142.118', // ir-email-monitor droplet
    port: 1080
  },
  de: {
    name: '🇩🇪 Germany (Coming Soon)',
    host: '167.71.142.118', // Placeholder - same UK server
    port: 1080
  },
  nl: {
    name: '🇳🇱 Netherlands (Coming Soon)',
    host: '167.71.142.118', // Placeholder - same UK server
    port: 1080
  },
  us: {
    name: '🇺🇸 United States (Coming Soon)',
    host: '167.71.142.118', // Placeholder - same UK server
    port: 1080
  }
};

// State
let isConnected = false;
let connectTime = null;
let timerInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  updateUI();

  if (isConnected) {
    startTimer();
  }
});

// Load state from storage
async function loadState() {
  try {
    const result = await chrome.storage.local.get(['isConnected', 'selectedServer', 'connectTime']);
    isConnected = result.isConnected || false;
    connectTime = result.connectTime || null;

    if (result.selectedServer) {
      serverSelect.value = result.selectedServer;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

// Save state to storage
async function saveState() {
  try {
    await chrome.storage.local.set({
      isConnected,
      selectedServer: serverSelect.value,
      connectTime
    });
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Update UI based on state
function updateUI() {
  if (isConnected) {
    statusIcon.className = 'status-icon connected';
    statusEmoji.textContent = '🔒';
    statusLabel.className = 'status-label connected';
    statusLabel.textContent = 'Protected';
    connectBtn.className = 'connect-btn disconnect';
    connectBtn.textContent = 'Disconnect';
    serverSelect.disabled = true;
    connectionInfo.style.display = 'block';

    const server = SERVERS[serverSelect.value];
    infoServer.textContent = server.name;

    // Get current IP
    fetchCurrentIp();
  } else {
    statusIcon.className = 'status-icon disconnected';
    statusEmoji.textContent = '🔓';
    statusLabel.className = 'status-label disconnected';
    statusLabel.textContent = 'Disconnected';
    connectBtn.className = 'connect-btn connect';
    connectBtn.textContent = 'Connect';
    serverSelect.disabled = false;
    connectionInfo.style.display = 'none';

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
}

// Show connecting state
function showConnecting() {
  statusIcon.className = 'status-icon connecting';
  statusEmoji.textContent = '⏳';
  statusLabel.className = 'status-label connecting';
  statusLabel.textContent = 'Connecting...';
  connectBtn.disabled = true;
  connectBtn.textContent = 'Connecting...';
}

// Show error message
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
  setTimeout(() => {
    errorMsg.classList.remove('show');
  }, 5000);
}

// Connect button handler
connectBtn.addEventListener('click', async () => {
  if (isConnected) {
    await disconnect();
  } else {
    await connect();
  }
});

// Connect to VPN
async function connect() {
  showConnecting();

  const serverId = serverSelect.value;
  const server = SERVERS[serverId];

  try {
    // Send message to background script to enable proxy
    const response = await chrome.runtime.sendMessage({
      action: 'connect',
      server: {
        host: server.host,
        port: server.port
      }
    });

    if (response.success) {
      isConnected = true;
      connectTime = Date.now();
      await saveState();
      updateUI();
      startTimer();
    } else {
      throw new Error(response.error || 'Connection failed');
    }
  } catch (e) {
    showError('Failed to connect: ' + e.message);
    isConnected = false;
    updateUI();
  }

  connectBtn.disabled = false;
}

// Disconnect from VPN
async function disconnect() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'disconnect'
    });

    if (response.success) {
      isConnected = false;
      connectTime = null;
      await saveState();
      updateUI();
    } else {
      throw new Error(response.error || 'Disconnect failed');
    }
  } catch (e) {
    showError('Failed to disconnect: ' + e.message);
  }
}

// Start connection timer
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (connectTime) {
      const elapsed = Date.now() - connectTime;
      const seconds = Math.floor(elapsed / 1000) % 60;
      const minutes = Math.floor(elapsed / 60000) % 60;
      const hours = Math.floor(elapsed / 3600000);

      infoTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// Fetch current IP address
async function fetchCurrentIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    infoIp.textContent = data.ip;
  } catch (e) {
    infoIp.textContent = 'Unknown';
  }
}

// Server select change handler
serverSelect.addEventListener('change', saveState);
