# NewsNest: Story Publishing Rate Limit

## What was wrong

The story publishing endpoint accepted unlimited requests. A script could
send thousands of `POST /api/articles` requests quickly and push genuine news
out of view.

## How the problem was reproduced

The following kind of loop could publish every request successfully:

```bash
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/articles \
    -H "Content-Type: application/json" \
    -d '{"title":"Spam","summary":"Spam story","category":"india"}'
done
```

Before the fix, every request returned `201 Created`.

## What changed

### Server-side publishing limit

NewsNest now limits story creation requests by client IP:

- The first 5 `POST /api/articles` requests in a 1-minute window are allowed.
- The 6th and later requests in that window return HTTP `429`.
- The response is JSON with a clear error message.
- The response includes a `Retry-After` header showing when to try again.
- The limiter only checks `POST` requests under `/api/articles`.

GET requests, including article lists, featured stories, trending stories, and
categories, are not limited.

### Configurable settings

The limit can be changed through environment variables:

```env
ARTICLE_RATE_LIMIT_MAX=5
ARTICLE_RATE_LIMIT_WINDOW_MS=60000
```

These settings are documented in `server/.env.example`.

### Client message

The Write a story page recognizes a `429` response and shows this friendly
message:

> You have published several stories recently. Please wait a moment and try
> again.

### Dependencies

No new package was added. The limiter uses a small in-memory `Map` containing
timestamps for each client.

## How the solution works

1. The request enters the `/api/articles` middleware.
2. GET requests immediately continue without counting.
3. For POST requests, the client IP is used as the key.
4. Old timestamps outside the configured window are removed.
5. If the client already has 5 recent requests, the middleware returns `429`
   and `Retry-After`.
6. Otherwise, the current request timestamp is recorded and the article route
   continues normally.

## Tests and verification

Added tests verify that:

- Five POST requests are allowed.
- The sixth POST request returns `429`.
- The response contains JSON and `Retry-After`.
- Requests are allowed again after the window expires.
- GET requests are never limited.

Verified with:

- `npm test -w server`
- `npm run build -w client`

## What is done

- Added dependency-free story publishing rate limiting.
- Added configurable max requests and window duration.
- Added JSON `429` responses with `Retry-After`.
- Kept GET endpoints unrestricted.
- Added a friendly client message for rate-limit responses.
- Added regression tests.

## What is not included

- This is an in-memory limiter, so counters reset when the server restarts.
- It is intended for the current single-process NewsNest setup. A multi-server
  deployment would need a shared store such as Redis.
- No general rate limit was added to GET requests.
- No unrelated API or UI behavior was changed.
- The `docs/` folder is ignored by Git and is for local explanation and
  presentation use only.

## Simple explanation for a presentation

> NewsNest allowed unlimited story publishing, so an automated script could
> flood the site with spam. We added a server-side limit of 5 story submissions
> per client per minute. The sixth request receives a 429 response and a
> Retry-After time. Normal GET requests still work, and the Write a story page
> tells users to wait when they reach the limit. The limit is configurable and
> uses no extra dependency.
