import net from 'net';

/**
 * Query Minecraft server status using Server List Ping protocol
 * https://wiki.vg/Server_List_Ping
 */
async function queryMinecraftServer(host, port = 25565, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = new net.Socket();
    let responded = false;

    const cleanup = () => {
      if (!client.destroyed) {
        client.destroy();
      }
    };

    const timeoutId = setTimeout(() => {
      if (!responded) {
        cleanup();
        resolve({
          online: false,
          error: 'Connection timeout'
        });
      }
    }, timeout);

    client.setTimeout(timeout);

    client.on('timeout', () => {
      if (!responded) {
        responded = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve({
          online: false,
          error: 'Connection timeout'
        });
      }
    });

    client.on('error', (error) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve({
          online: false,
          error: error.message
        });
      }
    });

    client.connect(port, host, () => {
      try {
        // Send handshake packet
        const handshake = Buffer.concat([
          Buffer.from([0x00]), // Packet ID
          writeVarInt(757), // Protocol version (1.18+)
          writeVarInt(host.length), // Server address length
          Buffer.from(host, 'utf8'), // Server address
          Buffer.from([port >> 8, port & 0xFF]), // Port (unsigned short)
          writeVarInt(1) // Next state (1 = status)
        ]);

        const handshakePacket = Buffer.concat([
          writeVarInt(handshake.length),
          handshake
        ]);

        // Send status request packet
        const statusRequest = Buffer.from([0x01, 0x00]); // Packet length 1, Packet ID 0

        client.write(Buffer.concat([handshakePacket, statusRequest]));

        let responseData = Buffer.alloc(0);

        client.on('data', (data) => {
          responseData = Buffer.concat([responseData, data]);

          try {
            // Parse response
            let offset = 0;

            // Read packet length
            const { value: packetLength, length: lengthBytes } = readVarInt(responseData, offset);
            offset += lengthBytes;

            if (responseData.length < offset + packetLength) {
              // Wait for more data
              return;
            }

            // Read packet ID (should be 0x00)
            const { value: packetId, length: idBytes } = readVarInt(responseData, offset);
            offset += idBytes;

            if (packetId !== 0x00) {
              throw new Error('Invalid packet ID');
            }

            // Read JSON response length
            const { value: jsonLength, length: jsonLengthBytes } = readVarInt(responseData, offset);
            offset += jsonLengthBytes;

            // Read JSON response
            const jsonData = responseData.slice(offset, offset + jsonLength).toString('utf8');
            const serverData = JSON.parse(jsonData);

            const latency = Date.now() - startTime;

            if (!responded) {
              responded = true;
              clearTimeout(timeoutId);
              cleanup();

              resolve({
                online: true,
                version: serverData.version?.name || 'Unknown',
                protocol: serverData.version?.protocol || 0,
                players: {
                  online: serverData.players?.online || 0,
                  max: serverData.players?.max || 0
                },
                description: typeof serverData.description === 'string'
                  ? serverData.description
                  : serverData.description?.text || '',
                latency,
                favicon: serverData.favicon || null
              });
            }
          } catch (error) {
            if (!responded) {
              responded = true;
              clearTimeout(timeoutId);
              cleanup();
              resolve({
                online: false,
                error: `Parse error: ${error.message}`
              });
            }
          }
        });
      } catch (error) {
        if (!responded) {
          responded = true;
          clearTimeout(timeoutId);
          cleanup();
          resolve({
            online: false,
            error: error.message
          });
        }
      }
    });
  });
}

// Helper functions for VarInt encoding/decoding
function writeVarInt(value) {
  const bytes = [];
  do {
    let byte = value & 0x7F;
    value >>>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (value !== 0);
  return Buffer.from(bytes);
}

function readVarInt(buffer, offset = 0) {
  let value = 0;
  let length = 0;
  let currentByte;

  do {
    if (offset + length >= buffer.length) {
      throw new Error('VarInt exceeds buffer length');
    }
    currentByte = buffer[offset + length];
    value |= (currentByte & 0x7F) << (7 * length);
    length++;
    if (length > 5) {
      throw new Error('VarInt is too big');
    }
  } while ((currentByte & 0x80) !== 0);

  return { value, length };
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

    let host = 'localhost';
    let port = 25565;

    try {
      const data = fs.default.readFileSync(DATA_FILE, 'utf8');
      const content = JSON.parse(data);

      if (content.servers?.minecraft?.serverIP) {
        host = content.servers.minecraft.serverIP;
        port = content.servers.minecraft.port || 25565;
      } else if (content.serverInfo?.serverIP) {
        // Backward compatibility
        host = content.serverInfo.serverIP;
        port = content.serverInfo.port || 25565;
      }
    } catch (error) {
      // Use defaults if content.json doesn't exist
      console.error('Could not read server config:', error);
    }

    const status = await queryMinecraftServer(host, port);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      server: {
        host,
        port
      },
      ...status
    });
  } catch (error) {
    console.error('Minecraft status error:', error);
    return res.status(500).json({
      online: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
