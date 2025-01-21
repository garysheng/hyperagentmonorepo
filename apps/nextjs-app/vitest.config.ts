import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./lib/__tests__/setup.ts'],
    testTimeout: 20000, // 20 seconds since we're making real API calls
  },
}); 