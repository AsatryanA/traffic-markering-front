import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const verificationFileName = (code) => `tiktok${code}.txt`;

const verificationFileBody = (code) => `tiktok-developers-site-verification=${code}\n`;

const tiktokSiteVerification = (code) => ({
  name: 'tiktok-site-verification',
  configureServer(server) {
    if (!code) {
      return;
    }
    const path = `/${verificationFileName(code)}`;
    server.middlewares.use((req, res, next) => {
      if (req.url !== path) {
        next();
        return;
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(verificationFileBody(code));
    });
  },
  generateBundle() {
    if (!code) {
      return;
    }
    this.emitFile({
      type: 'asset',
      fileName: verificationFileName(code),
      source: verificationFileBody(code),
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tiktokCode = process.env.TIKTOK_SITE_VERIFICATION || env.TIKTOK_SITE_VERIFICATION || '';

  return {
    plugins: [react(), tiktokSiteVerification(tiktokCode)],
    server: {
      // 0.0.0.0 — чтобы дев-сервер был виден из докера и с телефона в той же сети
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
