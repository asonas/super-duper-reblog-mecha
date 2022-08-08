import { defineConfig, resolveBaseUrl, resolvePackageEntry } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

import { resolve } from "path"
const manifest = defineManifest({
  manifest_version: 3,
  name: "SUPER DUPER Reblog MECHA",
  version: "1.0.0",
  background: {
    service_worker: "background.js"
  },
  action: {
    default_popup: "index.html"
  },
  commands: {
    "reblog": {
      suggested_key: {
        default: "Ctrl+Shift+1"
      },
      description: "reblog"
    }
  }
})

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "background.ts")
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  },
  plugins: [react(), crx({manifest})]
})
