/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    // The user-event driven form tests are I/O-heavy; the default 5s is tight
    // on slower machines and CI.
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
      exclude: ['src/main.*', '**/*.d.ts', 'src/tests/**', '**/vite-env*'],
    },
  },
})
