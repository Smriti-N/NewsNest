import 'dotenv/config';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT_FILE = resolve(__dirname, '../../.port');
const PREFERRED_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_RETRIES = 10;

function writePortFile(port) {
  try {
    writeFileSync(PORT_FILE, String(port), 'utf8');
  } catch {
    // Non-critical — Vite falls back to the default port
  }
}

function cleanupPortFile() {
  try {
    unlinkSync(PORT_FILE);
  } catch {
    // File may not exist
  }
}

function startServer(port, retries) {
  const server = app.listen(port, () => {
    writePortFile(port);
    console.log(`NewsNest API running on http://localhost:${port}`);
    if (port !== PREFERRED_PORT) {
      console.log(
        `  (port ${PREFERRED_PORT} was in use, fell back to ${port})`
      );
    }
    console.log(
      process.env.MONGO_URI
        ? 'Storage: MongoDB'
        : 'Storage: in-memory mock mode (data resets on restart)'
    );
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries > 0) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} is in use, trying ${nextPort}... (${retries - 1} retries left)`
      );
      startServer(nextPort, retries - 1);
    } else {
      console.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    }
  });
}

// Clean up the port file on shutdown
process.on('SIGINT', () => { cleanupPortFile(); process.exit(0); });
process.on('SIGTERM', () => { cleanupPortFile(); process.exit(0); });

startServer(PREFERRED_PORT, MAX_PORT_RETRIES);
