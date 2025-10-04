// Load content from API
async function loadContent() {
    try {
        const response = await fetch('/api/content');
        const data = await response.json();

        // Update page content
        if (data.serverInfo) {
            document.getElementById('nav-logo').textContent = data.serverInfo.name || 'EVU Server';
            document.getElementById('hero-title').textContent = data.serverInfo.title || 'Welcome to EVU Server';
            document.getElementById('hero-subtitle').textContent = data.serverInfo.subtitle || 'QBCore FiveM Roleplay Experience';
            document.getElementById('server-version').textContent = data.serverInfo.version || 'QBCore v1.0';
        }

        if (data.serverStatus) {
            updateServerStatus(data.serverStatus);
        }

        if (data.features) {
            renderFeatures(data.features);
        }
    } catch (error) {
        console.error('Failed to load content:', error);
    }
}

function updateServerStatus(status) {
    const statusIndicator = document.getElementById('server-status');
    const statusText = document.getElementById('status-text');
    const playerCount = document.getElementById('player-count');
    const uptime = document.getElementById('uptime');

    const currentPlayers = Math.floor(Math.random() * status.maxPlayers);

    if (status.isOnline) {
        statusIndicator.classList.add('online');
        statusIndicator.classList.remove('offline');
        statusText.textContent = 'Online';
        statusText.style.color = 'var(--success-color)';
    } else {
        statusIndicator.classList.add('offline');
        statusIndicator.classList.remove('online');
        statusText.textContent = 'Offline';
        statusText.style.color = 'var(--accent-color)';
    }

    playerCount.textContent = `${currentPlayers}/${status.maxPlayers}`;
    uptime.textContent = status.uptime;
}

function renderFeatures(features) {
    const container = document.getElementById('features-container');
    container.innerHTML = '';

    features.forEach(feature => {
        container.innerHTML += `
            <div class="info-card">
                <h3>${feature.icon} ${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `;
    });
}

// Update status on page load
document.addEventListener('DOMContentLoaded', function() {
    loadContent();

    // Refresh status every 30 seconds
    setInterval(() => {
        fetch('/api/status')
            .then(res => res.json())
            .then(status => updateServerStatus(status))
            .catch(err => console.error('Status update error:', err));
    }, 30000);
});

// Optional: Add real-time server status using FiveM server API
// Example API endpoint: https://servers-frontend.fivem.net/api/servers/single/[SERVER_ID]
/*
async function fetchRealServerStatus() {
    try {
        const response = await fetch('YOUR_SERVER_API_ENDPOINT');
        const data = await response.json();

        // Update UI with real data
        document.getElementById('player-count').textContent =
            `${data.players}/${data.maxPlayers}`;

        // Update other stats as needed
    } catch (error) {
        console.error('Failed to fetch server status:', error);
    }
}
*/
