# NewsNest API

The Express server in `server/` exposes a small JSON API under `/api`. While you run `npm run dev`, it listens on **http://localhost:5000**. The Vite dev server on port 5173 forwards every `/api/...` request to it, so the React app calls plain paths such as `/api/articles`.

All examples below were run against a local server and their responses copied from it. Long summaries are shortened with `...`. Timestamps will differ on your machine because seed stories are dated relative to when the server started.

> **Tip:** Every API call waits a random 0–700 ms to imitate a slow network. Set `API_DELAY_MS=0` in `server/.env` to turn this off while you experiment.

## Contents

| Method | Path | What it does |
| --- | --- | --- |
| GET | [`/api/health`](#get-apihealth) | Check that the server is up |
| GET | [`/api/categories`](#get-apicategories) | All categories with story counts |
| GET | [`/api/articles`](#get-apiarticles) | List, filter, search and page through stories |
| GET | [`/api/articles/featured`](#get-apiarticlesfeatured) | Stories for the home page carousel |
| GET | [`/api/articles/trending`](#get-apiarticlestrending) | Most-read stories |
| GET | [`/api/articles/:id`](#get-apiarticlesid) | One story |
| GET | [`/api/articles/:id/related`](#get-apiarticlesidrelated) | Other stories in the same category |
| POST | [`/api/articles/:id/view`](#post-apiarticlesidview) | Count one view |
| POST | [`/api/articles`](#post-apiarticles) | Publish a new story |

## The story object

Most endpoints return stories in this shape:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `a1`, `a2`, ... in memory mode; a MongoDB ObjectId when `MONGO_URI` is set |
| `category` | string | One of the category slugs from `/api/categories` |
| `title` | string | Headline, at most 120 characters |
| `summary` | string | At most 50 words |
| `source` | string | Who wrote it. Defaults to `"Reader submission"` |
| `url` | string | Link to the full story. May be empty |
| `views` | number | How many times the story was opened |
| `featured` | boolean | `true` puts it in the home page carousel |
| `publishedAt` | string | ISO 8601 date and time |

## Errors

Errors always come back as JSON with a matching HTTP status code.

| Status | When | Body |
| --- | --- | --- |
| 400 | `POST /api/articles` with invalid fields | `{ "errors": ["...", "..."] }`: one message per problem |
| 404 | Unknown story id | `{ "error": "Story not found" }` |
| 404 | Unknown path under `/api` | `{ "error": "Not found" }` |
| 500 | Unexpected server error | `{ "error": "Something went wrong" }` |

---

## GET /api/health

Returns `ok` when the server is running. It skips the simulated delay, so it is a quick way to check the server.

```bash
curl http://localhost:5000/api/health
```

**200**

```json
{ "status": "ok" }
```

## GET /api/categories

Every category, in display order, with the number of stories in it.

```bash
curl http://localhost:5000/api/categories
```

**200**

```json
[
  { "slug": "technology", "name": "Technology", "count": 4 },
  { "slug": "business", "name": "Business", "count": 3 },
  { "slug": "sports", "name": "Sports", "count": 3 },
  { "slug": "politics", "name": "Politics", "count": 3 },
  { "slug": "health", "name": "Health", "count": 3 },
  { "slug": "science", "name": "Science", "count": 3 },
  { "slug": "entertainment", "name": "Entertainment", "count": 3 },
  { "slug": "world", "name": "World", "count": 4 },
  { "slug": "india", "name": "India", "count": 4 }
]
```

## GET /api/articles

Lists stories, one page at a time. All query parameters are optional.

| Parameter | Default | Meaning |
| --- | --- | --- |
| `category` | all | A category slug such as `sports`. Leave it out or use `all` for every category |
| `q` | none | Search text. Matches stories whose headline or summary contains it |
| `sort` | `latest` | `latest` = newest first by `publishedAt`; `popular` = most `views` first |
| `page` | `1` | Which page to return, starting at 1 |
| `limit` | `10` | Stories per page. Capped at 100 |

The filters are applied in this order: category, then search, then sort, then the page is cut out.

```bash
curl "http://localhost:5000/api/articles?q=Metro&limit=5"
```

**200**

```json
{
  "items": [
    {
      "id": "a1",
      "category": "india",
      "title": "Metro line linking airport and old town opens",
      "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday. ...",
      "source": "Riverton Times",
      "url": "https://example.com/stories/metro-line-opens",
      "views": 8420,
      "featured": true,
      "publishedAt": "2026-10-31T05:36:25.423Z"
    }
  ],
  "page": 1,
  "limit": 5,
  "total": 1,
  "hasMore": false
}
```

- `total` is the number of stories that match the filters across all pages.
- `hasMore` is `true` when asking for `page + 1` would return more stories. The home page uses it to show or hide **Load more stories**.

## GET /api/articles/featured

Up to 5 stories with `featured: true`, newest first. They fill the carousel at the top of the home page.

```bash
curl http://localhost:5000/api/articles/featured
```

**200**

```json
[
  {
    "id": "a12",
    "category": "technology",
    "title": "Open-source browser adds built-in reading mode",
    "summary": "A popular open-source web browser has added a reading mode ...",
    "source": "Tech Pulse",
    "url": "https://example.com/stories/reading-mode",
    "views": 7710,
    "featured": true,
    "publishedAt": "2026-10-31T08:36:16.894Z"
  }
]
```

(Shortened to one story.)

## GET /api/articles/trending

The most-read stories, highest `views` first.

| Parameter | Default | Meaning |
| --- | --- | --- |
| `limit` | `5` | How many stories to return. Capped at 20 |

```bash
curl "http://localhost:5000/api/articles/trending?limit=2"
```

**200**

```json
[
  {
    "id": "a19",
    "category": "sports",
    "title": "Underdogs clinch league title on last-day goal",
    "summary": "Lakeside United won their first league title in thirty years ...",
    "source": "Sports Desk",
    "url": "https://example.com/stories/league-title",
    "views": 9980,
    "featured": true,
    "publishedAt": "2026-10-31T06:36:16.894Z"
  },
  {
    "id": "a5",
    "category": "world",
    "title": "Nations agree on shared rules for ocean plastic",
    "summary": "Delegates from forty countries signed an agreement ...",
    "source": "World Wire",
    "url": "https://example.com/stories/ocean-plastic",
    "views": 9120,
    "featured": true,
    "publishedAt": "2026-10-30T22:36:16.894Z"
  }
]
```

## GET /api/articles/:id

One story by id.

```bash
curl http://localhost:5000/api/articles/a1
```

**200**

```json
{
  "id": "a1",
  "category": "india",
  "title": "Metro line linking airport and old town opens",
  "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday. ...",
  "source": "Riverton Times",
  "url": "https://example.com/stories/metro-line-opens",
  "views": 8420,
  "featured": true,
  "publishedAt": "2026-10-31T05:36:16.894Z"
}
```

**404**: no story has that id.

```bash
curl http://localhost:5000/api/articles/nope
```

```json
{ "error": "Story not found" }
```

## GET /api/articles/:id/related

Up to 4 other stories from the same category, newest first. The story itself is never included. Returns **404** `{ "error": "Story not found" }` for an unknown id.

```bash
curl http://localhost:5000/api/articles/a1/related
```

**200**

```json
[
  {
    "id": "a4",
    "category": "india",
    "title": "Pre-monsoon showers bring relief after heatwave",
    "summary": "Cities across the central plains recorded their first pre-monsoon showers overnight ...",
    "source": "NewsNest Desk",
    "url": "https://example.com/stories/pre-monsoon",
    "views": 3980,
    "featured": false,
    "publishedAt": "2026-10-31T01:36:16.894Z"
  }
]
```

(Shortened to one story.)

## POST /api/articles/:id/view

Adds 1 to a story's `views`. The story page calls this once per story per visit. No request body.

```bash
curl -X POST http://localhost:5000/api/articles/a1/view
```

**200**

```json
{ "id": "a1", "views": 8421 }
```

**404**: `{ "error": "Story not found" }` for an unknown id.

## POST /api/articles

Publishes a new story. Send JSON with a `Content-Type: application/json` header.

| Field | Required | Rules |
| --- | --- | --- |
| `title` | yes | Not blank, at most 120 characters (after trimming spaces) |
| `summary` | yes | Not blank, at most 50 words |
| `category` | yes | One of the slugs from `/api/categories` |
| `source` | no | Defaults to `"Reader submission"` |
| `url` | no | Link to the full story |

New stories always start with `views: 0`, `featured: false` and `publishedAt` set to now. Any other fields you send are ignored.

```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Library opens late-night study hall","summary":"The city library will stay open until midnight during exam season.","category":"india","source":"Riverton Times","url":"https://example.com/library"}'
```

**201**: the stored story, including its new `id`.

```json
{
  "id": "a31",
  "views": 0,
  "featured": false,
  "title": "Library opens late-night study hall",
  "summary": "The city library will stay open until midnight during exam season.",
  "category": "india",
  "source": "Riverton Times",
  "url": "https://example.com/library",
  "publishedAt": "2026-10-31T10:36:16.969Z"
}
```

**400**: one or more fields are invalid. Every problem is listed.

```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"","summary":"","category":"cooking"}'
```

```json
{ "errors": ["Title is required.", "Summary is required.", "Pick a valid category."] }
```

In memory mode, published stories disappear when the server restarts.
