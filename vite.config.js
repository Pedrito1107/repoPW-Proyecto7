// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const shouldMinify = env.VITE_MINIFY === 'true'
  const minSuffix = shouldMinify ? '.min' : ''

  return {
    base: '/dist/', 
    publicDir: false,
    plugins: [
      react()
    ],
    build: {
      emptyOutDir: false,
      outDir: 'public/dist',
      minify: shouldMinify,
      rollupOptions: {
        input: {
           'public': resolve(__dirname, 'src/entries/public.jsx'),
           'student': resolve(__dirname, 'src/entries/student.jsx'),
           'manager': resolve(__dirname, 'src/entries/manager.jsx'),
        },
        output: {
          entryFileNames: `js/[name]${minSuffix}.js`,
          chunkFileNames: `js/[name]${minSuffix}.js`,
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return `css/[name]${minSuffix}[extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': 'http://localhost:4000',
        '/healthz': 'http://localhost:4000'
      }
    }
  }
})