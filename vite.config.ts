import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ImageConverter/', // 👈 Pastikan baris ini ada
});