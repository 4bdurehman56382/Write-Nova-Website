import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';

interface OAuthState {
  siteOrigin: string;
  expiresAt: number;
}

function readState(state: string | null, secret: string | undefined): OAuthState | undefined {
  if (!state || !secret) return undefined;

  const separator = state.lastIndexOf('.');
  if (separator < 1) return undefined;

  const payload = state.slice(0, separator);
  const suppliedSignature = state.slice(separator + 1);
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('base64url');

  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(suppliedSignature), Buffer.from(expectedSignature))) {
    return undefined;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as OAuthState;
    if (!decoded.siteOrigin || !decoded.expiresAt || decoded.expiresAt < Date.now()) return undefined;
    return decoded;
  } catch {
    return undefined;
  }
}

function errorPage(message: string, status = 400): Response {
  return new Response(`<!doctype html><title>WriteNova CMS login</title><p>${message}</p>`, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function popupPage(accessToken: string, targetOrigin: string): Response {
  const message = JSON.stringify(`authorization:github:success:${JSON.stringify({ token: accessToken, provider: 'github' })}`)
    .replace(/</g, '\\u003c');
  const safeOrigin = JSON.stringify(targetOrigin).replace(/</g, '\\u003c');
  const html = `<!doctype html><title>WriteNova CMS login</title><p>Finishing sign-in…</p><script>
    const targetOrigin = ${safeOrigin};
    const successMessage = ${message};
    window.opener.postMessage('authorizing:github', targetOrigin);
    window.addEventListener('message', (event) => {
      if (event.origin !== targetOrigin) return;
      window.opener.postMessage(successMessage, targetOrigin);
      window.close();
    }, false);
  </script>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const state = readState(requestUrl.searchParams.get('state'), import.meta.env.CMS_OAUTH_STATE_SECRET);
  const code = requestUrl.searchParams.get('code');
  const clientId = import.meta.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!state || !code || !clientId || !clientSecret) {
    return errorPage('The GitHub sign-in could not be completed. Return to the CMS and try again.');
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: new URL('/oauth/callback', requestUrl).toString(),
    }),
  });

  const tokenData = await tokenResponse.json() as { access_token?: string };
  if (!tokenResponse.ok || !tokenData.access_token) {
    return errorPage('GitHub did not approve this CMS sign-in. Return to the CMS and try again.', 502);
  }

  return popupPage(tokenData.access_token, state.siteOrigin);
};
