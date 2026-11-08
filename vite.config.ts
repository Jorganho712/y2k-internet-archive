import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativa: o build funciona em qualquer hospedagem estática gratuita
// (GitHub Pages, Netlify, Vercel, ou simplesmente abrindo a pasta dist/).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, host: true },
});
