/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_ADMIN_PASSWORD?: string;
}

declare const __APP_BUILD_VERSION__: string;
declare const __APP_ENV__: string;
