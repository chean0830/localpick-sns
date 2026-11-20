import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api, /uploads 요청은 Spring Boot(8080)로 프록시 → 같은 출처처럼 세션 쿠키 사용
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
      '/img': 'http://localhost:8080',
    },
  },
});
