// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom', 'node'
  },
})
