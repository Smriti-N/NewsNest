import test from 'node:test';
import assert from 'node:assert/strict';
import { createArticleRateLimiter } from '../src/middleware/articleRateLimit.js';

function responseDouble() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('allows five POST requests and rejects the sixth with Retry-After', () => {
  let currentTime = 10_000;
  const limiter = createArticleRateLimiter({
    maxRequests: 5,
    windowMs: 60_000,
    now: () => currentTime,
  });
  const req = { method: 'POST', ip: 'client-1' };

  for (let index = 0; index < 5; index += 1) {
    const res = responseDouble();
    let called = false;
    limiter(req, res, () => {
      called = true;
    });
    assert.equal(called, true);
    assert.equal(res.statusCode, 200);
  }

  const blocked = responseDouble();
  limiter(req, blocked, () => {
    throw new Error('blocked request should not continue');
  });

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.error, 'Too many stories published. Please try again later.');
  assert.equal(blocked.headers['Retry-After'], '60');

  currentTime += 60_000;
  const allowedAfterWindow = responseDouble();
  let called = false;
  limiter(req, allowedAfterWindow, () => {
    called = true;
  });
  assert.equal(called, true);
});

test('does not limit GET requests', () => {
  const limiter = createArticleRateLimiter({ maxRequests: 1 });
  const req = { method: 'GET', ip: 'client-1' };
  const res = responseDouble();
  let called = false;

  limiter(req, res, () => {
    called = true;
  });
  limiter(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Retry-After'], undefined);
});
