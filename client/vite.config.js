import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT_FILE = resolve(__dirname, '../.port');

function getApiPort() {
  try {
    const port = readFileSync(PORT_FILE, 'utf8').trim();
    if (port && !isNaN(port)) return Number(port);
  } catch {
    // .port file doesn't exist yet — server hasn't started or uses default
  }
  return 5000; // fallback to default
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${getApiPort()}`,
    },
  },
});
