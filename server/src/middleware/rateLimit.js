// A small in-memory, fixed-window rate limiter. Each client (by IP address)
// may make `max` requests per `windowMs`. Extra requests get a 429 with a
// Retry-After header until the window resets. No extra dependency needed.
export function rateLimit({ max, windowMs, message }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    // Drop expired entries now and then so the map can't grow forever.
    if (hits.size > 1000) {
      for (const [k, e] of hits) if (e.resetAt <= now) hits.delete(k);
    }

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: message(retryAfter) });
    }
    next();
  };
}
