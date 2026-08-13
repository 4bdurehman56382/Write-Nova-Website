import type { APIRoute } from 'astro';
import { portalSessionCookie } from '../../../lib/portal-auth';

export const prerender = false;

export const POST: APIRoute = ({ cookies }) => {
  cookies.delete(portalSessionCookie, { path: '/' });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
