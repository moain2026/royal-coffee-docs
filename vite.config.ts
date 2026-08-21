import cloudflarePages from '@hono/vite-build/cloudflare-pages'
import vercel from '@hono/vite-build/vercel'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

/**
 * One codebase, two deploy targets.
 *   npm run build          → Cloudflare Pages  (dist/_worker.js)
 *   BUILD_TARGET=vercel …  → Vercel Edge       (.vercel/output/…)
 * The Hono app itself is platform-agnostic: no Node built-ins,
 * no filesystem access, Web-standard Request/Response only.
 */
const target = process.env.BUILD_TARGET ?? 'cloudflare'

export default defineConfig({
  plugins: [
    target === 'vercel' ? vercel() : cloudflarePages(),
    devServer({ adapter, entry: 'src/index.tsx' }),
  ],
  build: {
    // one CSS/JS asset each, hashed by the platform's static handler
    cssMinify: 'lightningcss',
    reportCompressedSize: true,
  },
})
