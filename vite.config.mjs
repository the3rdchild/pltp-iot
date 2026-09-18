import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true,
      // Proxy relative /api calls (axios apiClient baseURL, raw fetch() in
      // hooks like useAi1Data/useAi2Data) to the local backend in dev.
      //
      // Target overridable via VITE_PROXY_TARGET. Needed when Vite runs inside
      // a container: there `localhost` resolves to the frontend container
      // itself, not the backend, so every /api call fails. Docker compose sets
      // it to the backend service name (e.g. http://backend:5000). Default is
      // unchanged, so running natively needs no configuration.
      proxy: {
        '/api': {
          // process.env dulu: variabel dari `docker compose environment:` hanya
          // muncul di sana, sedangkan loadEnv() cuma membaca berkas .env.
          target: process.env.VITE_PROXY_TARGET || env.VITE_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    preview: {
      open: true,
      host: true,
      // Tunnel (cloudflared/ngrok) mengirim Host header asing; tanpa ini Vite 6
      // membalas "Blocked request. This host is not allowed."
      allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ts.net'],
      // `preview` tidak mewarisi server.proxy, padahal apiConfig.json memakai
      // baseURL relatif '/api'. Default ke API produksi supaya preview build
      // menampilkan data nyata; override dengan VITE_PROXY_TARGET untuk backend lokal.
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_TARGET || env.VITE_PROXY_TARGET || 'https://pertasmart.unpad.ac.id',
          changeOrigin: true
        }
      }
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: [
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // }
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
      ]
    },
    base: '/',
    plugins: [react(), jsconfigPaths()]
  };
});
