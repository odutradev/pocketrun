import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@actions': path.resolve(import.meta.dirname, './src/api/actions'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@stores': path.resolve(import.meta.dirname, './src/stores'),
      '@api': path.resolve(import.meta.dirname, './src/api'),
      '@projectTypes': path.resolve(import.meta.dirname, './src/types'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@routes': path.resolve(import.meta.dirname, './src/routes'),
      '@styles': path.resolve(import.meta.dirname, './src/styles')
    }
  },
  server: {
    port: 3000
  }
})
