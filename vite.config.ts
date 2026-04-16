import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/mec': {
        target: 'https://expediente.mec.gub.uy',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          const query = url.searchParams.get('query') ?? ''
          return `/APPS/FILECENTER/CONSULTAWEB2.NSF/BuscarExpediente?OpenAgent&query=${query}`
        },
      },
    },
  },
})
