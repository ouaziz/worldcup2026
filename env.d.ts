/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_MATCHES_FEED_URL?: string
  readonly VITE_MATCH_REFRESH_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
