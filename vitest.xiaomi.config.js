import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/weather-xiaomi/**/*.test.js'],
  },
})
