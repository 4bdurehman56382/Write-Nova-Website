/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL?: string;
  readonly CMS_ADMIN_EMAIL?: string;
  readonly CMS_ADMIN_PASSWORD_HASH?: string;
  readonly CMS_SESSION_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
