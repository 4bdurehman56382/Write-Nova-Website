import { createHmac, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const sessionDuration = 60 * 60 * 12;

export const portalSessionCookie = 'writenova_portal_session';

const configuredEmail = () => import.meta.env.CMS_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
const configuredPasswordHash = () => import.meta.env.CMS_ADMIN_PASSWORD_HASH?.trim() ?? '';
const sessionSecret = () => import.meta.env.CMS_SESSION_SECRET?.trim() ?? '';

export const isPortalConfigured = () => Boolean(
  import.meta.env.DATABASE_URL
  && configuredEmail()
  && configuredPasswordHash()
  && sessionSecret(),
);

const signature = (value: string) => createHmac('sha256', sessionSecret()).update(value).digest('base64url');

export const createSession = (email: string) => {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDuration;
  const payload = `${Buffer.from(email).toString('base64url')}.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
};

export const getSessionEmail = (value?: string) => {
  if (!value || !sessionSecret()) return null;

  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const [encodedEmail, expiresAt, receivedSignature] = parts;
  const payload = `${encodedEmail}.${expiresAt}`;
  const expectedSignature = signature(payload);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  if (!Number.isInteger(Number(expiresAt)) || Number(expiresAt) < Math.floor(Date.now() / 1000)) return null;

  try {
    const email = Buffer.from(encodedEmail, 'base64url').toString('utf8').toLowerCase();
    return email === configuredEmail() ? email : null;
  } catch {
    return null;
  }
};

export const verifyPortalPassword = async (email: string, password: string) => {
  if (!isPortalConfigured() || email.trim().toLowerCase() !== configuredEmail()) return false;

  const [algorithm, saltHex, expectedHex] = configuredPasswordHash().split(':');
  if (algorithm !== 'scrypt' || !saltHex || !expectedHex || password.length > 512) return false;

  try {
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
};

export const sessionMaxAge = sessionDuration;
