import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'webSkel.js',
      name: 'WebSkel',
      fileName: 'webskel'
    }
  }
})
