import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // Load env file from parent directory (project root) and backend directory
  const rootEnv = loadEnv(mode, '../', '');
  const backendEnv = loadEnv(mode, '../backend', '');
  
  // Support both API_KEY and GEMINI_API_KEY (backend uses GEMINI_API_KEY)
  const apiKey = rootEnv.API_KEY || rootEnv.GEMINI_API_KEY || backendEnv.GEMINI_API_KEY || backendEnv.API_KEY || '';
  
  console.log('Vite config: API_KEY found:', !!apiKey, 'Length:', apiKey.length);
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  };
});