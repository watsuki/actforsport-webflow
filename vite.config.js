// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    
    rollupOptions: {
      input: 'main.js',
      output: {
        format: 'es',
        entryFileNames: 'main.js',
        assetFileNames: '[name].[ext]',
        inlineDynamicImports: true // ← Bundle TOUT
      }
    },
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  server: {
    port: 3000,
    open: false,
    cors: true
  }
})