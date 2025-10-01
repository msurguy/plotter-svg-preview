import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  // Allow GitHub Pages deployments to override the base path via VITE_BASE_PATH.
  const base = command === 'build' ? process.env.VITE_BASE_PATH || '/' : '/'

  return {
    base,
    plugins: [react()],
  }
})
