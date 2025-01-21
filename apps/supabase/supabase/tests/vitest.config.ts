import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig({
  test: {
    setupFiles: ['./setup.ts'],
    environment: 'node',
    env: loadEnv('test', process.cwd(), ''),
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../')
    }
  }
}) 