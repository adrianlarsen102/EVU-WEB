// Simulated server status check
// In production, this would connect to your actual FiveM server API

function updateServerStatus() {
    const statusIndicator = document.getElementById('server-status');
    const statusText = document.getElementById('status-text');
    const playerCount = document.getElementById('player-count');
    
    // Simulate server check (replace with actual API call)
    const isOnline = true; // Change this based on actual server status
    const currentPlayers = Math.floor(Math.random() * 64); // Random for demo
    const maxPlayers = 64;
    
    if (isOnline) {
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
    
    playerCount.textContent = `${currentPlayers}/${maxPlayers}`;
}

// Update status on page load
document.addEventListener('DOMContentLoaded', function() {
    updateServerStatus();
    
    // Update status every 30 seconds
    setInterval(updateServerStatus, 30000);
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
