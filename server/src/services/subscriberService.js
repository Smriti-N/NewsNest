// Keeps newsletter subscribers in memory. Like the in-memory story store,
// the list resets when the server restarts.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const subscribers = new Set();

// Returns { status, body } so the route can send it as it is.
export function subscribe(rawEmail) {
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    return { status: 400, body: { error: 'Please enter a valid email address.' } };
  }
  if (subscribers.has(email)) {
    return { status: 409, body: { error: 'This email is already subscribed.' } };
  }
  subscribers.add(email);
  return { status: 201, body: { email } };
}

export function subscriberCount() {
  return subscribers.size;
}
