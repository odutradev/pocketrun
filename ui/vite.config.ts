import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/ping': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
