import type { APIRoute } from 'astro';
import { getSubmissionStats, getVisitStats, isValidStatsRange } from '../../../lib/analytics';
import { getSessionEmail, isPortalConfigured, portalSessionCookie } from '../../../lib/portal-auth';

export const prerender = false;

const respond = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const signedIn = (cookie?: string) => isPortalConfigured() && Boolean(getSessionEmail(cookie));

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isPortalConfigured()) return respond(503, { ok: false, message: 'The content portal has not been connected yet.' });
  if (!signedIn(cookies.get(portalSessionCookie)?.value)) return respond(401, { ok: false, message: 'Please sign in to continue.' });

  const rangeParam = url.searchParams.get('range');
  const range = isValidStatsRange(rangeParam) ? rangeParam : 'day';

  try {
    const [visits, submissions] = await Promise.all([getVisitStats(range), getSubmissionStats(range)]);
    return respond(200, { ok: true, range, visits, submissions });
  } catch (error) {
    console.error('Unable to load portal stats.', error);
    return respond(502, { ok: false, message: 'Visit and submission stats could not be loaded.' });
  }
};
