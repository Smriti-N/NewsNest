function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const maxRequests = positiveInteger(process.env.ARTICLE_POST_LIMIT, 5);
const windowMs = positiveInteger(process.env.ARTICLE_POST_WINDOW_MS, 60_000);

export function createArticleRateLimit(limit = maxRequests, durationMs = windowMs) {
  const clients = new Map();
  let lastCleanup = 0;

  return function articleRateLimit(req, res, next) {
    const now = Date.now();

    if (now - lastCleanup >= durationMs) {
      for (const [client, bucket] of clients) {
        if (bucket.resetAt <= now) clients.delete(client);
      }
      lastCleanup = now;
    }

    const client = req.ip || req.socket.remoteAddress || 'unknown';
    let bucket = clients.get(client);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + durationMs };
    }

    if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'You are publishing stories too quickly. Please wait before trying again.',
      });
    }

    bucket.count += 1;
    clients.set(client, bucket);
    next();
  };
}

export const articleCreationRateLimit = createArticleRateLimit();
