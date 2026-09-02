import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 0.0.0.0 — чтобы дев-сервер был виден из докера и с телефона в той же сети
    port: 3000,
    host: '0.0.0.0',
  },
});
