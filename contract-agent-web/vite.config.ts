import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // @ 指向 src 目录，方便模块导入
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 开发环境代理，将 /api 与 /hubs 转发到后端服务，避免跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // SignalR 需要 WebSocket 支持
        ws: true,
      },
      // OnlyOffice 文档服务代理（默认 8080 端口）
      '/onlyoffice': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/onlyoffice/, ''),
      },
    },
  },
})
