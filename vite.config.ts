import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Change this to match where the built files will actually be served from.
  // - Deploying at a subpath of the main site, e.g. ishwariyogainstitute.in/portal/  -> '/portal/'
  // - Deploying at the root of its own domain/repo, e.g. portal.ishwariyogainstitute.in -> '/'
  // See README.md "Deploying" for details.
  base: '/portal/',
})
