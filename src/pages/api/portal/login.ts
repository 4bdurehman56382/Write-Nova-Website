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

const redirectToPortal = (search = '') => new Response(null, {
  status: 303,
  headers: { Location: `/portal${search || '?signed-in=1'}`, 'Cache-Control': 'no-store' },
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const acceptsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  if (!isPortalConfigured()) {
    return acceptsJson
      ? respond(503, { ok: false, message: 'The content portal has not been connected yet.' })
      : redirectToPortal('?error=setup');
  }

  let body: Record<string, unknown>;
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      body = await request.json();
    } else {
      const form = await request.formData();
      body = { email: form.get('email'), password: form.get('password') };
    }
  } catch {
    return acceptsJson
      ? respond(400, { ok: false, message: 'Please enter your email and password.' })
      : redirectToPortal('?error=invalid-login');
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const valid = await verifyPortalPassword(email, password);

  if (!valid) {
    return acceptsJson
      ? respond(401, { ok: false, message: 'That email or password is not recognised.' })
      : redirectToPortal('?error=invalid-login');
  }

  cookies.set(portalSessionCookie, createSession(email), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMaxAge,
  });

  return acceptsJson ? respond(200, { ok: true, email }) : redirectToPortal();
};
