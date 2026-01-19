# TechConcepts VPN - Chrome Extension

A simple Chrome extension that routes browser traffic through a proxy server for privacy protection.

## Features

- One-click connect/disconnect
- Multiple server locations (UK, Germany, Netherlands, US)
- Connection timer
- Shows current IP address
- Clean, modern UI

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `chrome-extension` folder
5. The extension icon will appear in your toolbar

## Configuration

### Setting Up Proxy Servers

Before the extension works, you need to set up SOCKS5 proxy servers. Edit `popup.js` and update the `SERVERS` object with your actual server addresses:

```javascript
const SERVERS = {
  uk: {
    name: '🇬🇧 United Kingdom',
    host: 'your-uk-server.com',  // Replace with your server
    port: 1080
  },
  // ... other servers
};
```

### Quick Proxy Server Setup (Using SSH)

The simplest way to create a SOCKS5 proxy is using SSH:

```bash
# On your server (e.g., DO droplet), ensure SSH is running
# Then from any machine, create a SOCKS proxy:
ssh -D 1080 -f -C -q -N user@your-server-ip
```

### Production Proxy Setup (Dante/3proxy)

For production, install a proper SOCKS5 server on your DO droplet:

```bash
# Install Dante SOCKS server (Ubuntu)
sudo apt update
sudo apt install dante-server

# Configure /etc/danted.conf
# Then start the service
sudo systemctl start danted
```

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration |
| `popup.html` | Extension popup UI |
| `popup.js` | Popup logic and state management |
| `background.js` | Service worker for proxy management |
| `icons/` | Extension icons (on/off states) |

## How It Works

1. User clicks "Connect" in the popup
2. `popup.js` sends message to `background.js`
3. `background.js` uses Chrome's `proxy` API to configure SOCKS5 proxy
4. All Chrome browser traffic routes through the proxy server
5. User's real IP is hidden from websites

## Limitations

- **Browser only**: This only protects Chrome traffic, not other apps
- **Not a true VPN**: Uses proxy, not VPN tunneling
- **Requires proxy server**: You must run your own proxy servers

## Publishing to Chrome Web Store

1. Create a ZIP of this folder (excluding `generate-icons.html` and `README.md`)
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay one-time $5 developer fee
4. Upload ZIP and fill in listing details
5. Submit for review (takes 1-3 days)

## Testing

1. Load the extension in developer mode
2. Click the extension icon
3. Select a server and click "Connect"
4. Visit [whatismyip.com](https://whatismyip.com) to verify IP changed
5. Click "Disconnect" to restore normal browsing

## Troubleshooting

**"Connection failed"**
- Check that your proxy server is running
- Verify the host and port in `popup.js`
- Check firewall rules on your server

**Websites not loading**
- Proxy server might be down
- Try disconnecting and reconnecting
- Check proxy server logs

## License

MIT License - TechConcepts 2026
