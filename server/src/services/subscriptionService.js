const subscribers = new Map();

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function subscribe(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      status: 400,
      message: 'Please enter a valid email address.',
    };
  }

  if (subscribers.has(normalizedEmail)) {
    return {
      ok: false,
      status: 409,
      message: 'This email is already subscribed.',
    };
  }

  subscribers.set(normalizedEmail, {
    email: normalizedEmail,
    subscribedAt: new Date().toISOString(),
  });

  return {
    ok: true,
    status: 201,
    message: 'You are subscribed to the Daily Digest.',
    subscriber: {
      email: normalizedEmail,
      subscribedAt: subscribers.get(normalizedEmail).subscribedAt,
    },
  };
}

export function getSubscriberCount() {
  return subscribers.size;
}

// Useful for tests only. Keep it exported so tests can reset in-memory state.
export function clearSubscribers() {
  subscribers.clear();
}

