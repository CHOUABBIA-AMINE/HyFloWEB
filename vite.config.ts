import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Polyfills for Node.js globals used by SockJS
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: 3000,
    sourcemap: false, // Disable source maps in dev to avoid console errors
  },
  build: {
    sourcemap: false, // Disable source maps in production build
  },
})