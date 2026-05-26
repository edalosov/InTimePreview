import { createHash } from 'crypto';

export function getSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD || '';
  return createHash('sha256').update(password + 'intimepreview-v1').digest('hex');
}

export function isAuthenticated(sessionCookieValue: string | null | undefined): boolean {
  if (!sessionCookieValue) return false;
  return sessionCookieValue === getSessionToken();
}
