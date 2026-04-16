import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 必须导入 path 模块

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 这里的配置告诉 Vite，当代码中出现 @ 时，去 src 文件夹找文件
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})