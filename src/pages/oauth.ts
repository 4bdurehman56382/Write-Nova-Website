import type { APIRoute } from 'astro';
import { createHmac } from 'node:crypto';

const tenMinutes = 10 * 60 * 1000;

function configuredOrigins(requestOrigin: string): string[] {
  const values = import.meta.env.CMS_ALLOWED_ORIGINS
    ?.split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean) ?? [];

  return [...new Set([requestOrigin, ...values])];
}

function originFromSiteId(siteId: string): string | undefined {
  try {
    const isLocal = /^localhost(?::\d+)?$/.test(siteId) || /^127\.0\.0\.1(?::\d+)?$/.test(siteId);
    return new URL(`${isLocal ? 'http' : 'https'}://${siteId}`).origin;
  } catch {
    return undefined;
  }
}

export const GET: APIRoute = ({ request }) => {
  const clientId = import.meta.env.GITHUB_OAUTH_CLIENT_ID;
  const stateSecret = import.meta.env.CMS_OAUTH_STATE_SECRET;

  if (!clientId || !stateSecret) {
    return new Response('The CMS OAuth connection is not configured yet.', { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const requestOrigin = requestUrl.origin;
  const siteId = requestUrl.searchParams.get('site_id') ?? requestUrl.host;
  const siteOrigin = originFromSiteId(siteId);

  if (!siteOrigin || !configuredOrigins(requestOrigin).includes(siteOrigin)) {
    return new Response('This CMS origin is not allowed.', { status: 403 });
  }

  const statePayload = Buffer.from(JSON.stringify({ siteOrigin, expiresAt: Date.now() + tenMinutes })).toString('base64url');
  const signature = createHmac('sha256', stateSecret).update(statePayload).digest('base64url');
  const callbackUrl = new URL('/oauth/callback', requestUrl).toString();
  const authorizationUrl = new URL('https://github.com/login/oauth/authorize');

  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('redirect_uri', callbackUrl);
  authorizationUrl.searchParams.set('scope', 'repo');
  authorizationUrl.searchParams.set('state', `${statePayload}.${signature}`);

  return Response.redirect(authorizationUrl, 302);
};
