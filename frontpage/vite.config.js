import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url' // 引入现代的 URL 解析方法

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 用这种方式完美解决 __dirname 找不到的问题
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 👇 加上这个 define 块
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/xechat': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  }
})