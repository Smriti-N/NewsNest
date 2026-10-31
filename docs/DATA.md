# Story data and seed stories

Every story you see in NewsNest when the server starts comes from one file: [`server/src/data/seed.json`](../server/src/data/seed.json). This page explains what each field means and how to add your own seed story.

## Where the data goes

```
seed.json ──► loadSeed.js ──► memoryStore.js (default)
                         └──► mongoStore.js  (only if MONGO_URI is set)
```

1. [`server/src/data/loadSeed.js`](../server/src/data/loadSeed.js) reads `seed.json` and turns each `hoursAgo` into a real `publishedAt` date.
2. In the default in-memory mode, [`memoryStore.js`](../server/src/store/memoryStore.js) keeps those stories in an array. **The seed is read again every time the server starts**, so edits to `seed.json` show up after a restart, and anything published through the app disappears.
3. With `MONGO_URI` set, [`mongoStore.js`](../server/src/store/mongoStore.js) copies the seed into MongoDB **only when the collection is empty**. Later edits to `seed.json` are not picked up until you empty the collection.

## Fields of a seed story

```json
{
  "id": "a1",
  "category": "india",
  "title": "Metro line linking airport and old town opens",
  "summary": "Riverton's long-awaited Metro line connecting the airport to the old town opened to commuters on Monday. ...",
  "source": "Riverton Times",
  "url": "https://example.com/stories/metro-line-opens",
  "hoursAgo": 5,
  "views": 8420,
  "featured": true
}
```

| Field | Type | Required | Example | What it is |
| --- | --- | --- | --- | --- |
| `id` | string | yes | `"a31"` | Unique id, used in story URLs such as `/article/a31`. Seed ids follow the pattern `a1`, `a2`, ... In MongoDB mode it is ignored and Mongo creates its own id |
| `category` | string | yes | `"science"` | One of the category slugs listed below |
| `title` | string | yes | `"Comet visible to the naked eye this week"` | The headline. At most 120 characters |
| `summary` | string | yes | `"Skywatchers can spot ..."` | The story itself. **At most 50 words** |
| `source` | string | yes | `"Science Today"` | Who reported it. Shown as "By ..." on the story page |
| `url` | string | yes | `"https://example.com/stories/comet"` | Link for the **Read the full story** button. Use an `https://example.com/...` address for made-up stories |
| `hoursAgo` | number | yes | `5` | How long before server start the story was published. See below |
| `views` | number | yes | `8420` | Starting view count. See below |
| `featured` | boolean | yes | `true` | Whether it can appear in the home page carousel. See below |

Valid categories (from [`server/src/constants.js`](../server/src/constants.js)):

`technology`, `business`, `sports`, `politics`, `health`, `science`, `entertainment`, `world`, `india`

### How `hoursAgo` becomes `publishedAt`

Seed stories would look stale if they had fixed dates, so they store an age instead. When the server starts, `loadSeed()` replaces `hoursAgo` with:

```js
publishedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
```

So `"hoursAgo": 5` always means "published 5 hours before the server started". The app shows that as "5 hr ago". `"hoursAgo": 30` shows as "1 day ago". `hoursAgo` itself is never sent to the browser; the API only returns `publishedAt`. Decimals work too: `0.5` is 30 minutes.

`publishedAt` decides the order of **Latest news**, the Categories page and the default Search order, and the date on the story page.

### What `views` changes

`views` is the starting number of reads; it goes up by one each time someone opens the story. The stories with the most views fill:

- the **Trending now** list on the home page (top 5)
- the **Breaking** ticker (top 6)
- the **Top News** page (top 10)
- Search results when you choose **Most read**

### What `featured` changes

The carousel at the top of the home page shows up to 5 stories with `"featured": true`, newest first. If more than 5 are featured, only the 5 newest appear. Stories published through **Write a story** are never featured.

## Add a new seed story, step by step

1. **Open** `server/src/data/seed.json`. It is one JSON array of story objects.
2. **Pick an id** that is not used yet. The seed currently ends at `a30`, so use `a31` (then `a32`, ...).
3. **Pick a category** from the list above. It must match exactly, in lowercase.
4. **Write the summary in 50 words or fewer.** The app is built on this rule. A word is anything separated by spaces, so count with:
   ```bash
   node -e "console.log('PASTE YOUR SUMMARY HERE'.trim().split(/\s+/).length)"
   ```
5. **Choose `hoursAgo`, `views` and `featured`.** Use a small `hoursAgo` (for example `1`) if you want the story near the top of Latest news, a large `views` (over `10000`) to put it top of Trending, and `true` for `featured` if you want it in the carousel.
6. **Add the object** at the end of the array, after the last `}`. Put a comma after the previous story, and match the file's style: 1-space indent for `{`, 2 spaces for fields. Example:
   ```json
    {
     "id": "a31",
     "category": "science",
     "title": "Comet visible to the naked eye this week",
     "summary": "Skywatchers can spot a bright comet low in the western sky just after sunset until Sunday. Astronomers say a clear horizon away from city lights gives the best view, and binoculars will show its glowing tail.",
     "source": "Science Today",
     "url": "https://example.com/stories/comet-visible",
     "hoursAgo": 1,
     "views": 120,
     "featured": false
    }
   ```
7. **Check the JSON is valid.** This prints the number of stories, or an error with the line that is wrong:
   ```bash
   node -e "console.log(require('./server/src/data/seed.json').length)"
   ```
8. **Restart the server** (stop `npm run dev` with Ctrl+C and start it again). `node --watch` also restarts it when you save the file.
9. **Check it in the app.** Open http://localhost:5173/article/a31, or search for a word from the headline. You can also run `curl http://localhost:5000/api/articles/a31`.

### Common mistakes

| Symptom | Cause |
| --- | --- |
| Server crashes with `SyntaxError: ... in JSON` | Missing comma between stories, or a trailing comma after the last one |
| Story is missing from a category page | `category` is misspelled or not lowercase |
| Two stories open the same page | Two stories share an `id` |
| Server crashes with `RangeError: Invalid time value` | A story has no `hoursAgo` (or it is not a number) |
| Edits don't show up in MongoDB mode | Mongo only seeds an empty collection. Drop the `articles` collection to re-seed |
