declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_LINKS_URL?: string;
}

interface Window {
  __POCKETRUN_CONFIG__?: {
    apiUrl?: string;
    linksUrl?: string;
  };
}
