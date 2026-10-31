const DEFAULT_MAX_REQUESTS = 5;
const DEFAULT_WINDOW_MS = 60 * 1000;

function readPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createArticleRateLimiter({
  maxRequests = readPositiveNumber(process.env.ARTICLE_RATE_LIMIT_MAX, DEFAULT_MAX_REQUESTS),
  windowMs = readPositiveNumber(
    process.env.ARTICLE_RATE_LIMIT_WINDOW_MS,
    DEFAULT_WINDOW_MS
  ),
  now = () => Date.now(),
} = {}) {
  const requestsByClient = new Map();

  return (req, res, next) => {
    if (req.method !== 'POST') return next();

    const client = req.ip || req.socket?.remoteAddress || 'unknown';
    const currentTime = now();
    const timestamps = (requestsByClient.get(client) || []).filter(
      (timestamp) => currentTime - timestamp < windowMs
    );

    if (timestamps.length >= maxRequests) {
      const retryAfter = Math.max(
        1,
        Math.ceil((timestamps[0] + windowMs - currentTime) / 1000)
      );
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Too many stories published. Please try again later.',
      });
    }

    timestamps.push(currentTime);
    requestsByClient.set(client, timestamps);
    return next();
  };
}

export default createArticleRateLimiter();
