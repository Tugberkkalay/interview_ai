import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' ensures we load all env vars, not just VITE_ prefixed ones.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This maps the system environment variable (from Cloudflare or .env)
      // to the process.env.API_KEY global constant used in the app.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY),
    },
  };
});