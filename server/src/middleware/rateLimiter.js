const ipRequests = new Map();

export function resetRateLimits() {
  ipRequests.clear();
}

export function articleRateLimiter(req, res, next) {
  if (req.method !== 'POST') return next();

  const maxRequests = Number(process.env.RATE_LIMIT_MAX ?? 5);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);

  const ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (ipRequests.get(ip) || []).filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    res.set('Retry-After', String(Math.max(1, retryAfterSec)));
    return res.status(429).json({
      error: `Too many stories published. Please wait ${Math.max(1, retryAfterSec)}s before posting again.`,
    });
  }

  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  next();
}

