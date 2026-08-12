import type { APIRoute } from 'astro';

export const prerender = false;

type ContactSubmission = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  service: string;
  details: string;
  budget: string;
  deadline: string;
};

const json = (status: number, body: Record<string, string | boolean>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

const text = (value: unknown, maxLength = 3000) => typeof value === 'string'
  ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength)
  : '';

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const emailPattern = /^\S+@\S+\.\S+$/;

const createEmail = (submission: ContactSubmission) => {
  const fields: Array<[string, string]> = [
    ['Full name', submission.fullName],
    ['Business / company', submission.company || 'Not provided'],
    ['Email address', submission.email],
    ['WhatsApp / phone', submission.phone],
    ['Country', submission.country],
    ['Service required', submission.service],
    ['Estimated budget', submission.budget || 'Not provided'],
    ['Expected deadline', submission.deadline || 'Not provided'],
    ['Project details', submission.details],
  ];

  const htmlRows = fields.map(([label, value]) => `<tr><td style="padding:10px 14px;border:1px solid #ded5ca;font-weight:700;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 14px;border:1px solid #ded5ca;white-space:pre-line">${escapeHtml(value)}</td></tr>`).join('');
  const textRows = fields.map(([label, value]) => `${label}: ${value}`).join('\n');

  return {
    htmlContent: `<main style="font-family:Arial,sans-serif;color:#211a1a"><h1 style="font-size:22px">New WriteNova project inquiry</h1><table style="border-collapse:collapse;width:100%;max-width:720px">${htmlRows}</table></main>`,
    textContent: `New WriteNova project inquiry\n\n${textRows}`,
  };
};

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: 'Please submit the form again.' });
  }

  const submission: ContactSubmission = {
    fullName: text(body.fullName, 160),
    company: text(body.company, 200),
    email: text(body.email, 254),
    phone: text(body.phone, 80),
    country: text(body.country, 100),
    service: text(body.service, 160),
    details: text(body.details, 5000),
    budget: text(body.budget, 100),
    deadline: text(body.deadline, 40),
  };

  const missingRequiredField = !submission.fullName || !submission.email || !submission.phone
    || !submission.country || !submission.service || !submission.details;

  if (missingRequiredField || !emailPattern.test(submission.email)) {
    return json(400, { ok: false, message: 'Please complete all required fields with a valid email address.' });
  }

  const apiKey = import.meta.env.BREVO_API_KEY;
  const fromEmail = import.meta.env.BREVO_FROM_EMAIL;
  const fromName = import.meta.env.BREVO_FROM_NAME || 'WriteNova';
  const toEmail = import.meta.env.CONTACT_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    console.error('Brevo contact form is missing configuration.');
    return json(503, { ok: false, message: 'The form is temporarily unavailable. Please try again shortly.' });
  }

  const email = createEmail(submission);

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to: [{ email: toEmail, name: 'WriteNova' }],
        replyTo: { email: submission.email, name: submission.fullName },
        subject: `New WriteNova project inquiry — ${submission.fullName}`,
        ...email,
        tags: ['website-inquiry'],
      }),
    });

    if (!brevoResponse.ok) {
      console.error('Brevo contact email failed.', { status: brevoResponse.status, body: (await brevoResponse.text()).slice(0, 500) });
      return json(502, { ok: false, message: 'We could not send your inquiry. Please try again in a moment.' });
    }
  } catch (error) {
    console.error('Brevo contact email request failed.', error);
    return json(502, { ok: false, message: 'We could not send your inquiry. Please try again in a moment.' });
  }

  return json(200, { ok: true, message: 'Thank you for contacting WriteNova. We’ve received your project details and will get back to you shortly.' });
};
