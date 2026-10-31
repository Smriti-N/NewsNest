# NewsNest REST API Documentation

Complete specification of all REST endpoints exposed by the NewsNest backend.

---

## 1. Overview & Base URL

- **Development Base URL**: `http://localhost:5000/api`
- **Frontend Proxy**: When running the client dev server (`http://localhost:5173`), requests to `/api` are automatically proxied to `http://localhost:5000/api`.
- **Default Format**: All request and response bodies use JSON (`Content-Type: application/json`).
- **Simulated Latency**: By default, requests have a random delay up to `700ms` (configured via `API_DELAY_MS`). Set `API_DELAY_MS=0` in `server/.env` to eliminate artificial delays.

---

## 2. Global Error Handling

All unhandled API errors return standard JSON responses:

| Status Code | Response Body | Description |
|---|---|---|
| **400 Bad Request** | `{"errors": ["<validation message>", ...]}` | Validation failures during article submission. |
| **404 Not Found** | `{"error": "Story not found"}` or `{"error": "Not found"}` | Target story ID or invalid endpoint route does not exist. |
| **500 Server Error** | `{"error": "Something went wrong"}` | Uncaught server exception. |

---

## 3. Endpoints

### 3.1 Health Check

Verifies server availability and connectivity.

- **Method**: `GET`
- **Route**: `/api/health`
- **Authentication**: None
- **Query Parameters**: None

#### Response
- **Status**: `200 OK`
```json
{
  "status": "ok"
}
```

---

### 3.2 Get Categories with Counts

Returns all supported categories along with the count of active articles in each category.

- **Method**: `GET`
- **Route**: `/api/categories`
- **Query Parameters**: None

#### Response
- **Status**: `200 OK`
```json
[
  { "slug": "technology", "name": "Technology", "count": 4 },
  { "slug": "business", "name": "Business", "count": 3 },
  { "slug": "sports", "name": "Sports", "count": 3 },
  { "slug": "politics", "name": "Politics", "count": 2 },
  { "slug": "health", "name": "Health", "count": 3 },
  { "slug": "science", "name": "Science", "count": 3 },
  { "slug": "entertainment", "name": "Entertainment", "count": 2 },
  { "slug": "world", "name": "World", "count": 4 },
  { "slug": "india", "name": "India", "count": 4 }
]
```

---

### 3.3 List Paginated Articles

Retrieves articles with support for category filtering, text search, sorting, and pagination.

- **Method**: `GET`
- **Route**: `/api/articles`
- **Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `category` | `string` | No | `all` | Filter by category slug (e.g., `india`, `technology`). Pass `all` or omit to include all categories. |
| `q` | `string` | No | empty | Substring text search against both `title` and `summary`. Case-sensitive. |
| `sort` | `string` | No | `latest` | Sort order: `latest` (by `publishedAt` descending) or `popular` (by `views` descending). |
| `page` | `integer`| No | `1` | One-based page number. |
| `limit` | `integer`| No | `10` | Results per page (clamped to a maximum of `100`). |

#### Example Request
```http
GET /api/articles?category=india&sort=latest&page=1&limit=2
```

#### Response
- **Status**: `200 OK`
```json
{
  "items": [
    {
      "id": "a1",
      "category": "india",
      "title": "Metro line linking airport and old town opens",
      "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday. Officials expect 80,000 daily riders, with trains every six minutes at peak hours. Tickets can be bought through a new mobile app or at station kiosks.",
      "source": "Riverton Times",
      "url": "https://example.com/stories/metro-line-opens",
      "views": 8420,
      "featured": true,
      "publishedAt": "2026-10-31T10:40:19.000Z"
    },
    {
      "id": "a4",
      "category": "india",
      "title": "Pre-monsoon showers bring relief after heatwave",
      "summary": "Cities across the central plains recorded their first pre-monsoon showers overnight, bringing temperatures down by five degrees after a week-long heatwave. Forecasters say more scattered rain is likely through the weekend, though they urge residents to keep drinking plenty of water.",
      "source": "NewsNest Desk",
      "url": "https://example.com/stories/pre-monsoon",
      "views": 3980,
      "featured": false,
      "publishedAt": "2026-10-31T06:40:19.000Z"
    }
  ],
  "page": 1,
  "limit": 2,
  "total": 4,
  "hasMore": true
}
```

---

### 3.4 Get Trending Articles

Retrieves top stories ranked strictly by view count (`views` descending).

- **Method**: `GET`
- **Route**: `/api/articles/trending`
- **Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `integer` | No | `5` | Maximum number of trending stories to return (clamped to max `20`). |

#### Response
- **Status**: `200 OK`
```json
[
  {
    "id": "a1",
    "category": "india",
    "title": "Metro line linking airport and old town opens",
    "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday...",
    "source": "Riverton Times",
    "url": "https://example.com/stories/metro-line-opens",
    "views": 8420,
    "featured": true,
    "publishedAt": "2026-10-31T10:40:19.000Z"
  }
]
```

---

### 3.5 Get Featured Articles

Retrieves highlighted stories marked with `featured: true`, sorted newest first. Used for the homepage hero carousel.

- **Method**: `GET`
- **Route**: `/api/articles/featured`
- **Query Parameters**: None (returns up to 5 featured articles)

#### Response
- **Status**: `200 OK`
```json
[
  {
    "id": "a1",
    "category": "india",
    "title": "Metro line linking airport and old town opens",
    "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday...",
    "source": "Riverton Times",
    "url": "https://example.com/stories/metro-line-opens",
    "views": 8420,
    "featured": true,
    "publishedAt": "2026-10-31T10:40:19.000Z"
  }
]
```

---

### 3.6 Get Single Article by ID

Retrieves complete article details for a given story ID.

- **Method**: `GET`
- **Route**: `/api/articles/:id`
- **URL Parameters**:
  - `id` (`string`, required): Story identifier (e.g., `a1`).

#### Success Response
- **Status**: `200 OK`
```json
{
  "id": "a1",
  "category": "india",
  "title": "Metro line linking airport and old town opens",
  "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday. Officials expect 80,000 daily riders, with trains every six minutes at peak hours. Tickets can be bought through a new mobile app or at station kiosks.",
  "source": "Riverton Times",
  "url": "https://example.com/stories/metro-line-opens",
  "views": 8420,
  "featured": true,
  "publishedAt": "2026-10-31T10:40:19.000Z"
}
```

#### Error Response
- **Status**: `404 Not Found`
```json
{
  "error": "Story not found"
}
```

---

### 3.7 Get Related Articles

Retrieves up to 4 recent stories from the same category as the target article, excluding the target story itself.

- **Method**: `GET`
- **Route**: `/api/articles/:id/related`
- **URL Parameters**:
  - `id` (`string`, required): Target story identifier.

#### Success Response
- **Status**: `200 OK`
```json
[
  {
    "id": "a2",
    "category": "india",
    "title": "Village school wins award for solar classrooms",
    "summary": "A government school in Ashgrove has won a national award after moving its classrooms to rooftop solar power...",
    "source": "Ashgrove Daily",
    "url": "https://example.com/stories/solar-school",
    "views": 2310,
    "featured": false,
    "publishedAt": "2026-10-30T13:40:19.000Z"
  }
]
```

#### Error Response
- **Status**: `404 Not Found` (if parent `:id` does not exist)
```json
{
  "error": "Story not found"
}
```

---

### 3.8 Record Article View

Increments the view count of the specified article by 1.

- **Method**: `POST`
- **Route**: `/api/articles/:id/view`
- **URL Parameters**:
  - `id` (`string`, required): Article identifier.
- **Request Body**: None

#### Success Response
- **Status**: `200 OK`
```json
{
  "id": "a1",
  "views": 8421
}
```

#### Error Response
- **Status**: `404 Not Found`
```json
{
  "error": "Story not found"
}
```

---

### 3.9 Create New Article

Submits a new 50-word story to the store.

- **Method**: `POST`
- **Route**: `/api/articles`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | `string` | Yes | Non-empty string, maximum 120 characters (`MAX_TITLE_LENGTH`). |
| `summary` | `string` | Yes | Non-empty string, maximum 50 words (`MAX_WORDS`). |
| `category` | `string` | Yes | Must match one of `CATEGORY_SLUGS`: `technology`, `business`, `sports`, `politics`, `health`, `science`, `entertainment`, `world`, `india`. |
| `source` | `string` | No | Attribution name. Defaults to `"Reader submission"`. |
| `url` | `string` | No | Link to external full article. Defaults to `""`. |

#### Example Request
```json
{
  "title": "Breakthrough optical processor runs at room temperature",
  "summary": "Physicists announced a breakthrough optical qubit architecture operating at standard ambient temperatures. The system achieved error correction without sub-zero helium cooling tanks, slashing deployment infrastructure costs by eighty percent across commercial server installations.",
  "category": "technology",
  "source": "Tech Horizon",
  "url": "https://example.com/quantum-breakthrough"
}
```

#### Success Response
- **Status**: `201 Created`
```json
{
  "id": "a31",
  "title": "Breakthrough optical processor runs at room temperature",
  "summary": "Physicists announced a breakthrough optical qubit architecture operating at standard ambient temperatures. The system achieved error correction without sub-zero helium cooling tanks, slashing deployment infrastructure costs by eighty percent across commercial server installations.",
  "category": "technology",
  "source": "Tech Horizon",
  "url": "https://example.com/quantum-breakthrough",
  "views": 0,
  "featured": false,
  "publishedAt": "2026-10-31T15:45:00.000Z"
}
```

#### Validation Error Response
- **Status**: `400 Bad Request`
```json
{
  "errors": [
    "Title must be 120 characters or fewer.",
    "Summary must be 50 words or fewer.",
    "Pick a valid category."
  ]
}
```
