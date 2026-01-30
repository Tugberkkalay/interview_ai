import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // Load env file from parent directory (project root) and backend directory
  const rootEnv = loadEnv(mode, '../', '');
  const backendEnv = loadEnv(mode, '../backend', '');
  
  // Support both API_KEY and GEMINI_API_KEY (backend uses GEMINI_API_KEY)
  // Frontend API Key removed as we use backend proxy
  const apiKey = '';
  
  console.log('Vite config: API_KEY found:', !!apiKey, 'Length:', apiKey.length);
  
  return {
    base: '/static/', // Ensure assets are served from root
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      cssCodeSplit: false, // Ensure CSS is bundled correctly
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  };
});