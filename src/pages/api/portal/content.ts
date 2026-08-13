import type { APIRoute } from 'astro';
import { isWebsiteContent, saveWebsiteContent } from '../../../lib/cms';
import { getSessionEmail, isPortalConfigured, portalSessionCookie } from '../../../lib/portal-auth';

export const prerender = false;

const respond = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const signedIn = (cookie?: string) => isPortalConfigured() && Boolean(getSessionEmail(cookie));

export const GET: APIRoute = async ({ cookies }) => {
  if (!isPortalConfigured()) return respond(503, { ok: false, message: 'The content portal has not been connected yet.' });
  if (!signedIn(cookies.get(portalSessionCookie)?.value)) return respond(401, { ok: false, message: 'Please sign in to continue.' });

  try {
    const { getWebsiteContent } = await import('../../../lib/cms');
    return respond(200, { ok: true, content: await getWebsiteContent() });
  } catch {
    return respond(502, { ok: false, message: 'The content portal could not load website content.' });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!isPortalConfigured()) return respond(503, { ok: false, message: 'The content portal has not been connected yet.' });
  if (!signedIn(cookies.get(portalSessionCookie)?.value)) return respond(401, { ok: false, message: 'Please sign in to continue.' });

  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return respond(400, { ok: false, message: 'The content could not be read. Please try again.' });
  }

  if (!isWebsiteContent(body.content)) return respond(400, { ok: false, message: 'The website content is incomplete. Refresh the portal and try again.' });

  try {
    await saveWebsiteContent(body.content);
    return respond(200, { ok: true, message: 'Published to the live website' });
  } catch (error) {
    console.error('Unable to save WriteNova website content.', error);
    return respond(502, { ok: false, message: 'Your changes could not be saved. Please try again.' });
  }
};
