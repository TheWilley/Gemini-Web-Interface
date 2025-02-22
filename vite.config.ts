import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  base: '/vite-quick-start/',
  envDir: './env',
  test: {
    globals: true,
    environment: 'jsdom',
  },
};
