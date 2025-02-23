import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  base: '/gemini-web-interface/',
  test: {
    globals: true,
    environment: 'jsdom',
  },
};
