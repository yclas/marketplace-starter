import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_YCLAS_URL is your Yclas site, e.g. https://demo.yclas.com.
// The browser calls it directly; add this app's address in your Yclas panel under
// Integrations > Your own front end, so the site answers it.
// While developing you can set VITE_YCLAS_PROXY=1 instead: the dev server then forwards /api to
// your site, so you don't need the address added yet (only for `npm run dev`, not for a build).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = env.VITE_YCLAS_PROXY === '1' && env.VITE_YCLAS_URL
    ? { '/api': { target: env.VITE_YCLAS_URL, changeOrigin: true, secure: true } }
    : undefined

  return {
    plugins: [react()],
    server: { host: true, port: 8080, proxy },
  }
})
