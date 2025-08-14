import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        webskel: 'index.js'
      },
      name: 'WebSkel',
      fileName: (format, entryName) => {
        return `${entryName}.${format === 'es' ? 'mjs' : 'umd.js'}`
      }
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        exports: 'named'
      }
    }
  }
})
