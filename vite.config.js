import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'webSkel.js',
      name: 'WebSkel',
      fileName: (format) => `webskel.${format}.js`
    }
  }
})
