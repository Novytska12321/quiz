import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages: https://<USERNAME>.github.io/quiz/
  base: '/quiz/',
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './src'),
    },
  },
})
