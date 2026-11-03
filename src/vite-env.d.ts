/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import type { PrecacheEntry } from 'workbox-precaching'

declare global {
  interface Window {
    __WB_MANIFEST: Array<string | PrecacheEntry>
  }
}

export {}
