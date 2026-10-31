# NewsNest Story Data & Seed Guide

This guide documents the story data structure, schema constraints, the dynamic date transformation mechanism, and instructions for adding new seed stories.

---

## 1. Overview

NewsNest ships with a curated set of initial stories in [`server/src/data/seed.json`](../server/src/data/seed.json).
When the backend starts up, [`server/src/data/loadSeed.js`](../server/src/data/loadSeed.js) loads this file and populates the active storage engine (either the in-memory array or MongoDB).

---

## 2. Story Data Schema

### Field Specification

| Field | Type | Location | Constraints | Description |
|---|---|---|---|---|
| `id` | `string` | Seed & Runtime | Unique string (e.g., `"a1"`, `"a2"`) | Monotonically prefixed ID. |
| `category` | `string` | Seed & Runtime | Must match one of the 9 allowed slugs | Category classification. |
| `title` | `string` | Seed & Runtime | Maximum 120 characters | The story headline. |
| `summary` | `string` | Seed & Runtime | **Maximum 50 words** | The core news summary. |
| `source` | `string` | Seed & Runtime | Non-empty string | Publisher or attribution (e.g., `"Riverton Times"`). |
| `url` | `string` | Seed & Runtime | Valid URL string | Link to original external publication. |
| `hoursAgo` | `number` | **Seed only** | Non-negative integer or float | Story age relative to current time in hours. |
| `publishedAt` | `string` | **Runtime only** | ISO 8601 string format | Computed publication timestamp. |
| `views` | `number` | Seed & Runtime | Non-negative integer | Initial view count. |
| `featured` | `boolean`| Seed & Runtime | `true` or `false` | When `true`, appears in the homepage Hero carousel. |

### Valid Category Slugs
The `category` field must match one of the slugs defined in [`server/src/constants.js`](../server/src/constants.js):
- `technology`
- `business`
- `sports`
- `politics`
- `health`
- `science`
- `entertainment`
- `world`
- `india`

---

## 3. Dynamic Date Transformation

### The Problem with Static Timestamps
If mock news data stored static ISO dates (e.g., `"2024-01-15T08:00:00.000Z"`), after a few weeks or months, all stories would permanently read "published 6 months ago" on the frontend, breaking the newsreader experience.

### How `loadSeed.js` Solves This
Instead of static timestamps, `seed.json` stores relative ages in hours via `hoursAgo`:

```javascript
// server/src/data/loadSeed.js
import { readFileSync } from 'node:fs';

const HOUR = 60 * 60 * 1000;

export function loadSeed() {
  const raw = JSON.parse(
    readFileSync(new URL('./seed.json', import.meta.url), 'utf8')
  );
  return raw.map(({ hoursAgo, ...story }) => ({
    ...story,
    publishedAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
  }));
}
```

### Mathematical Formula
$$\text{publishedAt} = \text{ISO\_String}(\text{Date.now}() - (\text{hoursAgo} \times 3600000))$$

### Transformation Example

| Seed Input (`seed.json`) | Computed Runtime Record (`loadSeed()`) | Frontend Display (`timeAgo.js`) |
|---|---|---|
| `"hoursAgo": 5` | `"publishedAt": "<now minus 5 hours>"` | `5 hours ago` |
| `"hoursAgo": 26` | `"publishedAt": "<now minus 26 hours>"` | `yesterday` or `1 day ago` |
| `"hoursAgo": 72` | `"publishedAt": "<now minus 72 hours>"` | `3 days ago` |

When a user submits a story at runtime via the `/write` form, `publishedAt` is stamped directly with `new Date().toISOString()`.

---

## 4. How to Add New Seed Stories

Follow these steps to add stories to the default seed dataset:

### Step 1: Open `server/src/data/seed.json`
Navigate to `server/src/data/seed.json` in your editor.

### Step 2: Determine the Next Unique ID
Inspect the last story entry in `seed.json`. If the last ID is `"a30"`, use `"a31"`.

### Step 3: Validate the Word Count
NewsNest enforces a strict limit of **50 words or fewer** on the summary. Count words using whitespace separation:
```bash
node -e "const s = 'Your 50-word summary text...'; console.log('Word count:', s.trim().split(/\s+/).length);"
```

### Step 4: Construct the Story JSON Object
Append a new JSON object to the array in `seed.json`:

```json
{
  "id": "a31",
  "category": "technology",
  "title": "Quantum computing prototype achieves room temperature operations",
  "summary": "Physicists announced a breakthrough optical qubit architecture operating at standard ambient temperatures. The system achieved error correction without sub-zero helium cooling tanks, slashing deployment infrastructure costs by eighty percent across commercial server installations.",
  "source": "Tech Horizon",
  "url": "https://example.com/stories/quantum-room-temp",
  "hoursAgo": 3,
  "views": 4200,
  "featured": true
}
```

### Step 5: Check JSON Formatting
Ensure a comma precedes the new item and that `seed.json` remains valid JSON:
```bash
node -e "JSON.parse(fs.readFileSync('server/src/data/seed.json', 'utf8')); console.log('Valid JSON');"
```

### Step 6: Test in the Application
- **In-Memory Mode**: Restart the backend server (`Ctrl + C` then `npm run dev`). Your new seed story will immediately appear on the homepage, category list, and hero carousel (if `featured: true`).
- **MongoDB Mode**: MongoDB seeds only when the collection is empty. To reload seed data into MongoDB:
  ```bash
  mongosh newsnest --eval "db.articles.drop()"
  ```
  Then restart the server to trigger `insertMany(loadSeed())`.
