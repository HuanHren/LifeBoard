import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { rmSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'lifeboard-remove-local-weather-reference-assets',
      closeBundle() {
        const localReferenceDistDir = fileURLToPath(
          new URL('./dist/__local_weather_reference', import.meta.url),
        )

        rmSync(localReferenceDistDir, {
          force: true,
          recursive: true,
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
