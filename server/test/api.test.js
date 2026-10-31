import { test, before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { countWords } from '../src/utils/wordCount.js';
import { resetRateLimits } from '../src/middleware/rateLimiter.js';
import { resetSubscribers } from '../src/routes/subscribe.js';

let server;
let baseUrl;

before(async () => {
  process.env.API_DELAY_MS = '0';
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
});

describe('Word Count Utility', () => {
  it('counts words separated by single spaces', () => {
    assert.equal(countWords('hello world'), 2);
  });

  it('counts words with multiple spaces, tabs and newlines', () => {
    assert.equal(countWords('hello\n\nworld\t  test'), 3);
  });

  it('returns 0 for empty or whitespace-only strings', () => {
    assert.equal(countWords(''), 0);
    assert.equal(countWords('   \n\t  '), 0);
  });

  it('handles hyphenated words and contractions', () => {
    assert.equal(countWords("don't stop"), 2);
  });
});

describe('API Endpoints', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
  });

  it('GET /api/categories returns categories with counts', async () => {
    const res = await fetch(`${baseUrl}/api/categories`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.ok('slug' in body[0]);
    assert.ok('count' in body[0]);
  });

  it('GET /api/articles/trending returns top viewed articles', async () => {
    const res = await fetch(`${baseUrl}/api/articles/trending?limit=5`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length <= 5);
  });

  it('GET /api/articles/featured returns featured articles', async () => {
    const res = await fetch(`${baseUrl}/api/articles/featured`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
  });

  it('GET /api/articles/:id returns 200 for existing article', async () => {
    const res = await fetch(`${baseUrl}/api/articles/a1`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, 'a1');
    assert.ok(body.title);
  });

  it('GET /api/articles/:id returns 404 for nonexistent article', async () => {
    const res = await fetch(`${baseUrl}/api/articles/nonexistent-xyz`);
    assert.equal(res.status, 404);
  });

  it('GET /api/articles filters properly by category', async () => {
    const res = await fetch(`${baseUrl}/api/articles?category=sports`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.items));
    for (const item of body.items) {
      assert.equal(item.category, 'sports');
    }
  });

  it('GET /api/articles searches case-insensitively', async () => {
    const res1 = await fetch(`${baseUrl}/api/articles?q=school`);
    const res2 = await fetch(`${baseUrl}/api/articles?q=School`);
    const body1 = await res1.json();
    const body2 = await res2.json();
    assert.equal(body1.total, body2.total);
    assert.ok(body1.total > 0);
  });

  it('GET /api/articles paginates correctly with limit=9', async () => {
    const res = await fetch(`${baseUrl}/api/articles?page=1&limit=9`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.items.length, 9);
    assert.equal(body.limit, 9);
  });

  it('GET /api/articles/:id/adjacent returns neighbouring stories', async () => {
    const res = await fetch(`${baseUrl}/api/articles/a1/adjacent`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok('prev' in body);
    assert.ok('next' in body);
  });

  it('POST /api/articles returns 400 for invalid data (missing title)', async () => {
    const res = await fetch(`${baseUrl}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: 'A short summary without title',
        category: 'technology',
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.errors && body.errors.length > 0);
  });

  it('POST /api/articles returns 400 for summary over 50 words', async () => {
    const longSummary = Array(60).fill('word').join(' ');
    const res = await fetch(`${baseUrl}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Title',
        summary: longSummary,
        category: 'technology',
      }),
    });
    assert.equal(res.status, 400);
  });

  it('POST /api/articles returns 201 when creating a valid story', async () => {
    resetRateLimits();
    const res = await fetch(`${baseUrl}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Fresh test story headline',
        summary: 'This is a valid test story summary under fifty words.',
        category: 'technology',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.title, 'Fresh test story headline');
  });

  it('POST /api/articles enforces rate limit (429)', async () => {
    resetRateLimits();
    for (let i = 0; i < 5; i++) {
      await fetch(`${baseUrl}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Rate test ${i}`,
          summary: 'Valid summary',
          category: 'technology',
        }),
      });
    }
    const rateLimitedRes = await fetch(`${baseUrl}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Rate test 6',
        summary: 'Valid summary',
        category: 'technology',
      }),
    });
    assert.equal(rateLimitedRes.status, 429);
    assert.ok(rateLimitedRes.headers.get('Retry-After'));
    resetRateLimits();
  });
});

describe('Newsletter Subscription', () => {
  before(() => {
    resetSubscribers();
  });

  it('POST /api/subscribe returns 201 on valid email', async () => {
    const res = await fetch(`${baseUrl}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reader@example.com' }),
    });
    assert.equal(res.status, 201);
  });

  it('POST /api/subscribe returns 409 for duplicate email (case-insensitive)', async () => {
    const res = await fetch(`${baseUrl}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'READER@example.com' }),
    });
    assert.equal(res.status, 409);
  });

  it('POST /api/subscribe returns 400 for invalid email', async () => {
    const res = await fetch(`${baseUrl}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    assert.equal(res.status, 400);
  });

  it('GET /api/subscribe/count returns subscriber count', async () => {
    const res = await fetch(`${baseUrl}/api/subscribe/count`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.count, 1);
  });
});

