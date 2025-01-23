import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

// Parse environment variables
const env: Record<string, string> = {};
if (envContent) {
  envContent.split('\n').forEach(line => {
    if (!line || line.startsWith('#')) return;
    const [key, ...valueParts] = line.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

export default defineConfig({
  test: {
    environment: 'node',
    env,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
}); 