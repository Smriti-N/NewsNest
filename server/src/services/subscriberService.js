const subscribers = new Set();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function validateEmail(body = {}) {
  const email = normalizeEmail(body?.email);
  if (!email) return { error: 'Email is required.' };
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email))
    return { error: 'Please enter a valid email address.' };
  return { email };
}

export function addSubscriber(email) {
  if (subscribers.has(email)) return false;
  subscribers.add(email);
  return true;
}

export function countSubscribers() {
  return subscribers.size;
}