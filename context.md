# WriteNova Website — Working Context

## Current status

Design One is now the active root project. The former Design Two implementation, its CMS files, and its dedicated assets have been removed. The website is a responsive Astro / TypeScript single-page agency site; source lives in `src/` and approved assets are in `Assets/`.

The services section was compacted in August 2026: the dark service overview sidebar was removed and all eight service cards now use the full section width in a four-column, two-row desktop grid. It falls back to two columns below tablet width so the full service descriptions remain readable. The changes are live on Vercel Production.

The Why WriteNova, process, industries, and footer areas were redesigned and deployed to Vercel Production in August 2026. Why WriteNova now pairs a wider display statement with a numbered vertical benefit list; the process uses five bordered panels on desktop; industries use the original numbered three-column field with a larger, 600-weight two-line heading and a tighter link to its supporting copy; and the footer is a simplified sign-off with one large project CTA. At mobile widths these areas collapse to a clear single-column reading flow.

Mobile QA in August 2026 covered 375 px, 390 px, 428 px, and 844 px landscape live-browser viewports with no horizontal overflow or clipped primary content. The latest redesigned Why WriteNova, process, and industries areas were rechecked locally at 390 px with a matching 390 px document width; the current industry index was also checked at 1440 px. The 320 px layout, expanded navigation, services, and inquiry sections also fit visually; headless Chrome shows a 16 px scrollbar artifact at that width because its reserved desktop scrollbar combines with the enforced `320px` minimum body width. Confirm the final experience on a physical iOS and Android device before launch.

## Product & content source

- Purpose: turn qualified business and agency visitors into WriteNova project enquiries.
- The approved source of truth is `WriteNova_Website_Content_Brief.docx`.
- The site was re-audited against the brief in August 2026. All approved hero messaging and CTAs, eight services, seven benefits, five process steps, nine industries, about copy, six FAQs and answers, navigation labels, project-inquiry labels, button text, and confirmation message match the document.

## Active design direction

- Near-black canvas with coral `#FF6D29`, brown `#453027`, and beige `#F2E5D4` as the universal light neutral. No pure-white site surfaces.
- Production logo: `Assets/writenova-mark.svg`.
- General Sans via Fontshare is the current font; it can be replaced with a licensed final brand font later.
- The visual system uses a compact header, structured long-scroll composition, coral-led accents, and restrained motion. It honors `prefers-reduced-motion`.
- WhatsApp and LinkedIn icons are present in both the header and footer. They route to configured values when supplied and safely fall back to the inquiry form otherwise.

## Technology and integrations

- Astro + TypeScript with native CSS.
- Vercel adapter for server-route support and deployment.
- GitHub remote: `https://github.com/4bdurehman56382/Write-Nova-Website.git` (private). The Neon CMS implementation is committed and pushed on `main`; the portal sign-in redirect and wider login heading were deployed to Vercel Production in commit `e8cf38d`.
- The enquiry form posts to the private `/api/contact` server endpoint, which sends through Brevo's transactional API. Production environment variables are configured with `coldplay56382@gmail.com` as the temporary sender, `4bdurehman56382@gmail.com` as the recipient, and the visitor's email as Reply-To. The Brevo sender must be verified before delivery will succeed; an external delivery test has not yet been run. FormSubmit is no longer used.
- The CMS is a branded WriteNova editor at `/portal`, backed by Neon Postgres through private Vercel API routes. It exposes all editable client content in a structured editor: website settings, Services, Why WriteNova benefits, Process steps, Industries, FAQs, contact and footer. It uses one chosen client login/password stored as server-side Vercel credentials. The `website_content` table was created successfully in Neon on August 14, 2026, and the approved baseline content was seeded into it after deployment. Neon connection, session, and temporary `admin/admin` credentials are set as encrypted Vercel Production variables. The Decap/GitHub OAuth variables were removed from Vercel. Portal login now makes a full authenticated redirect back to `/portal`, which is more reliable than an in-place view switch; production session and content checks pass.
- Basic SEO metadata, canonical and Open Graph URLs, and semantic structure are defined in `src/layouts/BaseLayout.astro`. GA4 and Search Console hooks activate from public environment variables.

## Required launch configuration

1. Copy `.env.example` to `.env`.
2. Verify `coldplay56382@gmail.com` as a sender in Brevo, then run a delivery test. Before launch, replace it with the final verified company sender and update `BREVO_FROM_EMAIL` in Vercel Production.
3. Add real `PUBLIC_WHATSAPP_NUMBER` and `PUBLIC_LINKEDIN_URL` to activate the social links. Until then they safely direct visitors to the inquiry form.
4. Optionally set `PUBLIC_GA_MEASUREMENT_ID` and `PUBLIC_GOOGLE_SITE_VERIFICATION` to activate GA4 and Search Console verification.
5. Neon CMS credentials are configured in Vercel Production. Before client handoff, replace the temporary `admin/admin` login with a strong unique credential as described in `CMS_SETUP.md`.
6. Replace `https://writenova.com` in `astro.config.mjs` if the final domain differs.
7. The Neon CMS was deployed successfully to Vercel Production on August 14, 2026. Production portal: `https://writenova-website.vercel.app/portal`.

## Useful commands

- `npm run dev` — local website preview.
- `npm run check` — Astro / TypeScript validation.
- `npm run build` — production build.
- `src/content/website.json` is the safe source fallback. Use `/portal` after completing `CMS_SETUP.md` to edit and publish live content.

## Working agreement

For every future request, read this file first and update it after the iteration. Open only files directly relevant to the request.
