import type { APIRoute } from 'astro';
import { getSessionEmail, isPortalConfigured, portalSessionCookie } from '../../../lib/portal-auth';

export const prerender = false;

const respond = (status: number, body: Record<string, string | boolean>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export const GET: APIRoute = ({ cookies }) => {
  if (!isPortalConfigured()) return respond(503, { ok: false, message: 'The content portal has not been connected yet.' });

  const email = getSessionEmail(cookies.get(portalSessionCookie)?.value);
  if (!email) return respond(401, { ok: false, message: 'Please sign in to continue.' });

  return respond(200, { ok: true, email });
};
