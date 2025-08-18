import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration for port 3001 - Testing instance
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist-3001',
  },
})
