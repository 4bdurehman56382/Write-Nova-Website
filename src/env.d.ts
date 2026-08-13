/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_DECAP_GITHUB_REPO?: string;
  readonly PUBLIC_DECAP_GITHUB_BRANCH?: string;
  readonly PUBLIC_DECAP_OAUTH_BASE_URL?: string;
  readonly GITHUB_OAUTH_CLIENT_ID?: string;
  readonly GITHUB_OAUTH_CLIENT_SECRET?: string;
  readonly CMS_OAUTH_STATE_SECRET?: string;
  readonly CMS_ALLOWED_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
