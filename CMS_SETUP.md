# WriteNova Content Portal setup

The website includes a private, WriteNova-branded editor at `/portal`. The client signs in with the email and password you choose. They do **not** need GitHub, and saving an edit updates the live website without a Git commit or Vercel redeployment.

The portal uses [Neon](https://console.neon.tech) on its free plan. Neon holds the content; the website and portal connect through private Vercel server routes, so the database connection string never reaches the browser.

## One-time setup

1. Create a free Neon project at [console.neon.tech](https://console.neon.tech). In the project dashboard, select **Connect** and copy the pooled connection string. It starts with `postgresql://`.
2. Open Neon’s **SQL Editor**, create a query, paste the full contents of [`neon/schema.sql`](./neon/schema.sql), and click **Run**. This creates the content record used by the site, plus the `page_visits` and `form_submissions` tables that power the Overview charts in the portal.
3. Choose the login name (an email address is recommended) and strong password the client will use for `/portal`. Generate a secure password hash locally:

   ```bash
   node scripts/hash-cms-password.mjs "your-strong-client-password"
   ```

   Copy the full line that starts `scrypt:`. It is a one-way hash, not the client’s actual password.
4. Generate a session secret:

   ```bash
   openssl rand -hex 32
   ```

5. In Vercel, add these four **Production** environment variables, then redeploy:

   ```env
   DATABASE_URL=your-pooled-neon-connection-string
   CMS_ADMIN_EMAIL=client@example.com
   CMS_ADMIN_PASSWORD_HASH=scrypt:the-generated-full-password-hash
   CMS_SESSION_SECRET=the-generated-session-secret
   ```

   Do not use `PUBLIC_` on any of these values. Do not commit the connection string, password hash, or session secret to Git.
6. Open `https://writenova-website-client.vercel.app/portal`, sign in using the client email and password, confirm the starting copy, then click **Save changes** once. That first save places the approved website content in Neon.

## Editing the website

Open `/portal` and sign in. The left navigation separates core settings, page copy, services, benefits, process, industries, FAQs, and contact/footer content. Add or remove list entries directly. Press **Save changes** to publish your edit.

The portal is intentionally not linked in the public navigation. Share its link and password only with people who are allowed to change the website.

## Changing access

To change the client password, generate a new `CMS_ADMIN_PASSWORD_HASH` with the script above, update that Vercel environment variable, and redeploy. To change their login name, update `CMS_ADMIN_EMAIL` and redeploy. This setup uses one editor account; it is deliberate for a single-client website and keeps the login simple.

The old `/admin` address redirects to `/portal` for convenience. After the Neon portal is deployed and working, remove the unused Decap/GitHub OAuth environment variables from Vercel and delete the old GitHub OAuth app.
