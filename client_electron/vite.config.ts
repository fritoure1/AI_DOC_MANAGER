import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        
        vite: {
          build: {
            rollupOptions: {
              external: ['@prisma/client', '.prisma/client'] 
            }
          }
        }
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        input: 'electron/preload.ts',
      },
      // Ployfill the Electron and Node.js built-in modules for Renderer process.
      renderer: {},
    }),
  ],
})