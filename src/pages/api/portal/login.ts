import type { APIRoute } from 'astro';
import {
  createSession,
  isPortalConfigured,
  portalSessionCookie,
  sessionMaxAge,
  verifyPortalPassword,
} from '../../../lib/portal-auth';

export const prerender = false;

const respond = (status: number, body: Record<string, string | boolean>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isPortalConfigured()) return respond(503, { ok: false, message: 'The content portal has not been connected yet.' });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return respond(400, { ok: false, message: 'Please enter your email and password.' });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const valid = await verifyPortalPassword(email, password);

  if (!valid) return respond(401, { ok: false, message: 'That email or password is not recognised.' });

  cookies.set(portalSessionCookie, createSession(email), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMaxAge,
  });

  return respond(200, { ok: true, email });
};
