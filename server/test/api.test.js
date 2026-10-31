import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Turn off the simulated network delay and make sure the in-memory store is
// used. Both must be set before the app is imported.
process.env.API_DELAY_MS = '0';
delete process.env.MONGO_URI;
const { default: app } = await import('../src/app.js');

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api`;
});

after(() => new Promise((resolve) => server.close(resolve)));

async function api(path, options = {}) {
  const res = await fetch(base + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return { status: res.status, body: await res.json() };
}

const validStory = {
  title: 'Test story from the API tests',
  summary: 'A short summary that is well under the fifty word limit.',
  category: 'science',
};

test('GET /api/health reports ok', async () => {
  const { status, body } = await api('/health');
  assert.equal(status, 200);
  assert.deepEqual(body, { status: 'ok' });
});

test('GET /api/categories lists every category with a count', async () => {
  const { status, body } = await api('/categories');
  assert.equal(status, 200);
  assert.equal(body.length, 9);
  for (const c of body) {
    assert.equal(typeof c.slug, 'string');
    assert.equal(typeof c.name, 'string');
    assert.ok(Number.isInteger(c.count) && c.count >= 0);
  }
});

test('GET /api/articles/trending returns the most-read stories first', async () => {
  const { status, body } = await api('/articles/trending?limit=3');
  assert.equal(status, 200);
  assert.equal(body.length, 3);
  assert.ok(body[0].views >= body[1].views && body[1].views >= body[2].views);
});

test('GET /api/articles/featured returns only featured stories', async () => {
  const { status, body } = await api('/articles/featured');
  assert.equal(status, 200);
  assert.ok(body.length > 0);
  assert.ok(body.every((a) => a.featured === true));
});

test('GET /api/articles/:id returns the story', async () => {
  const { status, body } = await api('/articles/a1');
  assert.equal(status, 200);
  assert.equal(body.id, 'a1');
  for (const field of ['title', 'summary', 'category', 'publishedAt', 'views']) {
    assert.ok(field in body, `missing ${field}`);
  }
});

test('GET /api/articles/:id returns 404 for an unknown id', async () => {
  const { status, body } = await api('/articles/does-not-exist');
  assert.equal(status, 404);
  assert.equal(typeof body.error, 'string');
});

test('GET /api/articles/:id/related returns other stories in the same category', async () => {
  const { body: story } = await api('/articles/a1');
  const { status, body } = await api('/articles/a1/related');
  assert.equal(status, 200);
  assert.ok(body.every((a) => a.category === story.category && a.id !== 'a1'));
});

test('POST /api/articles/:id/view adds one view', async () => {
  const { body: before } = await api('/articles/a2');
  const { status, body } = await api('/articles/a2/view', { method: 'POST' });
  assert.equal(status, 200);
  assert.equal(body.views, before.views + 1);
});

test('POST /api/articles publishes a valid story', async () => {
  const { status, body } = await api('/articles', {
    method: 'POST',
    body: JSON.stringify(validStory),
  });
  assert.equal(status, 201);
  assert.equal(body.title, validStory.title);
  assert.equal(body.views, 0);
  assert.ok(body.id);

  const fetched = await api(`/articles/${body.id}`);
  assert.equal(fetched.status, 200);
});

test('POST /api/articles rejects a story without a title', async () => {
  const { status, body } = await api('/articles', {
    method: 'POST',
    body: JSON.stringify({ ...validStory, title: '  ' }),
  });
  assert.equal(status, 400);
  assert.ok(Array.isArray(body.errors) && body.errors.length > 0);
});

test('POST /api/articles rejects an unknown category', async () => {
  const { status } = await api('/articles', {
    method: 'POST',
    body: JSON.stringify({ ...validStory, category: 'not-a-category' }),
  });
  assert.equal(status, 400);
});

test('unknown API routes return a JSON 404', async () => {
  const { status, body } = await api('/nope');
  assert.equal(status, 404);
  assert.equal(body.error, 'Not found');
});
