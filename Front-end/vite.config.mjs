import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [autoprefixer({})],
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.css'],
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/health': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },

    // ← أضف ده
    preview: {
      host: '0.0.0.0',
      port: process.env.PORT || 3000,
      allowedHosts: 'all',
    },
  }
})
