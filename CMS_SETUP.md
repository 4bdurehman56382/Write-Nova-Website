# WriteNova CMS setup

WriteNova uses **Decap CMS**. It is free and stores the website’s editable content in `src/content/website.json` inside the GitHub repository. Editors use `https://your-site/admin`, save their changes, and Vercel publishes the new Git commit automatically.

## One-time connection

1. The private repository is connected at [github.com/4bdurehman56382/Write-Nova-Website](https://github.com/4bdurehman56382/Write-Nova-Website). Push the local `main` branch before enabling the CMS, so Vercel and Decap have the source files to work with. Keep the repository private.
2. In Vercel, connect that GitHub repository to the WriteNova project. Vercel will then deploy every change made through the CMS.
3. In the GitHub account that owns the repository, create an OAuth app at [GitHub Developer Settings](https://github.com/settings/developers). Use:

   - **Application name:** `WriteNova CMS`
   - **Homepage URL:** `https://writenova-website.vercel.app`
   - **Authorization callback URL:** `https://writenova-website.vercel.app/oauth/callback`

   Use the final custom domain instead if it is already connected. Copy the OAuth app’s client ID and generate a client secret.

4. Add the following environment variables locally and in Vercel **Production**. Do not expose either secret in a `PUBLIC_` variable or commit it to Git.

   ```env
   PUBLIC_DECAP_GITHUB_REPO=your-github-owner/your-repository
   PUBLIC_DECAP_GITHUB_BRANCH=main
   PUBLIC_DECAP_OAUTH_BASE_URL=https://writenova-website.vercel.app
   GITHUB_OAUTH_CLIENT_ID=your-client-id
   GITHUB_OAUTH_CLIENT_SECRET=your-client-secret
   CMS_OAUTH_STATE_SECRET=a-long-random-secret
   CMS_ALLOWED_ORIGINS=https://writenova-website.vercel.app,http://localhost:4321
   ```

   Create the state secret with:

   ```bash
   openssl rand -hex 32
   ```

5. Redeploy the site, then visit `https://writenova-website.vercel.app/admin`. Sign in with a GitHub account that has write access to the repository. Each save creates a clearly labelled `content: update WriteNova website` commit and triggers Vercel.

## Editing content

The single **Edit website content** entry includes all approved client-editable content:

- SEO, social links, navigation, hero, every section heading and description, contact copy, and footer copy.
- Services, Why WriteNova benefits, process steps, industries, and FAQs. Drag list entries to change their display order.

The admin dashboard is intentionally not linked from the public website. Share `/admin` only with people who are allowed to edit the repository.

## Local editing

Use production `/admin` for normal editing. For local CMS login, keep `PUBLIC_DECAP_OAUTH_BASE_URL` pointing to the deployed production site and add `http://localhost:4321` to `CMS_ALLOWED_ORIGINS`. The deployed OAuth callback safely returns the sign-in result to the local editor, so the GitHub OAuth app’s callback URL can remain on the production site.
