/**
 * Query FiveM server status using HTTP API
 * FiveM servers expose player info and dynamic data via HTTP endpoints
 */
async function queryFiveMServer(serverIP, timeout = 5000) {
  try {
    // Extract connect URL or direct IP
    // FiveM connect format: "connect cfx.re/join/xxxxx" or direct IP
    let apiUrl;

    if (serverIP.includes('cfx.re/join/')) {
      // Extract join code from cfx.re URL
      const joinCode = serverIP.split('cfx.re/join/')[1];
      // Use FiveM's API to resolve the server
      apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${joinCode}`;
    } else {
      // Direct IP format (ip:port)
      const [host, port = '30120'] = serverIP.split(':');
      apiUrl = `http://${host}:${port}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response;
    let serverData;

    if (serverIP.includes('cfx.re/join/')) {
      // Query FiveM API
      response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      serverData = data.Data || data;

      return {
        online: true,
        hostname: serverData.hostname || serverData.vars?.sv_projectName || 'Unknown',
        players: {
          online: serverData.clients || serverData.players?.length || 0,
          max: serverData.svMaxclients || serverData.sv_maxClients || 32
        },
        gametype: serverData.gametype || serverData.vars?.gametype || 'Unknown',
        mapname: serverData.mapname || serverData.vars?.mapname || 'Unknown',
        resources: serverData.resources?.length || 0,
        server: serverData.server || serverData.vars?.sv_projectDesc || '',
        uptime: serverData.vars?.uptime || null,
        version: serverData.vars?.sv_version || null,
        connectEndPoints: serverData.connectEndPoints || [],
        rawData: {
          enhancedHostSupport: serverData.vars?.sv_enhancedHostSupport || false,
          scriptHookAllowed: serverData.vars?.sv_scriptHookAllowed || false
        }
      };
    } else {
      // Try direct connection to info endpoints
      const endpoints = [
        `${apiUrl}/info.json`,
        `${apiUrl}/players.json`,
        `${apiUrl}/dynamic.json`
      ];

      const results = await Promise.allSettled(
        endpoints.map(url =>
          fetch(url, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          }).then(r => r.ok ? r.json() : null)
        )
      );

      clearTimeout(timeoutId);

      const [infoResult, playersResult, dynamicResult] = results;

      const info = infoResult.status === 'fulfilled' ? infoResult.value : null;
      const players = playersResult.status === 'fulfilled' ? playersResult.value : null;
      const dynamic = dynamicResult.status === 'fulfilled' ? dynamicResult.value : null;

      if (!info && !players && !dynamic) {
        throw new Error('No response from server endpoints');
      }

      return {
        online: true,
        hostname: info?.vars?.sv_projectName || dynamic?.hostname || 'Unknown',
        players: {
          online: dynamic?.clients || players?.length || 0,
          max: info?.vars?.sv_maxClients || 32
        },
        gametype: info?.gametype || 'Unknown',
        mapname: info?.mapname || dynamic?.mapname || 'Unknown',
        resources: info?.resources?.length || 0,
        server: info?.server || '',
        version: info?.vars?.sv_version || null,
        rawData: info || {}
      };
    }
  } catch (error) {
    return {
      online: false,
      error: error.name === 'AbortError' ? 'Connection timeout' : error.message
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get server configuration from content
    const fs = await import('fs');
    const path = await import('path');
    const DATA_FILE = path.default.join(process.cwd(), 'data', 'content.json');

    let serverIP = 'localhost:30120';

    try {
      const data = fs.default.readFileSync(DATA_FILE, 'utf8');
      const content = JSON.parse(data);

      if (content.servers?.fivem?.serverIP) {
        serverIP = content.servers.fivem.serverIP;
      }
    } catch (error) {
      console.error('Could not read server config:', error);
    }

    const status = await queryFiveMServer(serverIP);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      server: {
        address: serverIP
      },
      ...status
    });
  } catch (error) {
    console.error('FiveM status error:', error);
    return res.status(500).json({
      online: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
