/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVAL_CLIENT_ID?: string;
  readonly VITE_EVAL_CLIENT_SECRET?: string;
  readonly VITE_EVAL_EMAIL?: string;
  readonly VITE_EVAL_ROLL_NO?: string;
  readonly VITE_EVAL_ACCESS_CODE?: string;
  readonly VITE_EVAL_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
