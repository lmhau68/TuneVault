import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Chuyển hướng các request gọi API sang Backend
      '/api': {
        target: 'http://localhost:5062',
        changeOrigin: true,
        secure: false,
      },
      // Chuyển hướng WebSockets cho tính năng SignalR (phần Notifications)
      '/hubs': {
        target: 'http://localhost:5062',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
});