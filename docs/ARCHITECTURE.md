# NewsNest Client-Server Architecture & Data Flow

This document details the architectural design, component hierarchy, data flow, and state management patterns of NewsNest.

---

## 1. High-Level System Architecture

NewsNest is built on a decoupled client-server architecture. The frontend is a Single-Page Application (SPA) powered by React and Vite, while the backend is an Express REST API with an abstracted dual-engine storage layer.

```mermaid
flowchart TD
  subgraph Client ["Frontend (Vite + React 18 SPA - Port 5173)"]
    UI["React UI Components & Pages"]
    CTX["Context Providers (Bookmarks, Toast)"]
    API_CLIENT["Client API Abstraction (src/api.js)"]
    LS[("Browser LocalStorage (Bookmarks)")]
    
    UI --> CTX
    CTX --> LS
    UI --> API_CLIENT
  end

  subgraph DevProxy ["Vite Development Server"]
    PROXY["Vite Proxy (/api -> http://localhost:5000)"]
    API_CLIENT --> PROXY
  end

  subgraph Server ["Backend (Express API - Port 5000)"]
    APP["Express App (src/app.js)"]
    ROUTER["Articles Router (src/routes/articles.js)"]
    SERVICE["Article Service (src/services/articleService.js)"]
    STORE_SWITCH{"Storage Engine Factory (getStore)"}

    PROXY --> APP
    APP --> ROUTER
    ROUTER --> SERVICE
    ROUTER --> STORE_SWITCH
  end

  subgraph Storage ["Storage Layer"]
    MEM[("In-Memory Store (Default)\nserver/src/store/memoryStore.js")]
    SEED[("Seed Data\nseed.json + loadSeed.js")]
    MONGO[("MongoDB (Optional)\nserver/src/store/mongoStore.js")]

    STORE_SWITCH -- "MONGO_URI not set" --> MEM
    MEM -. "initialized on boot" .-> SEED
    STORE_SWITCH -- "MONGO_URI set" --> MONGO
  end
```

---

## 2. Component Hierarchy & Responsibilities

### 2.1 Frontend (`client/src`)

The client is organized into modular pages, components, context providers, and hooks:

```
client/src/
├── api.js              # Centralized fetch wrapper for /api calls
├── App.jsx             # Root layout: Navbar, Route registry, Footer
├── main.jsx            # React root mount with BrowserRouter & Context Providers
├── styles.css          # Core CSS variables, light/dark themes, grid system
├── components/
│   ├── ArticleCard.jsx     # Card rendering 50-word story, category badge, bookmark action
│   ├── ArticleRow.jsx      # Compact row view used in Top News and search lists
│   ├── BookmarkButton.jsx  # Toggle button connected to BookmarksContext
│   ├── CategoryChips.jsx   # Filter pills (All, India, Technology, etc.)
│   ├── CategoryTiles.jsx   # Grid of category cards with live story counters
│   ├── Footer.jsx          # App footer with links and attribution
│   ├── Hero.jsx            # Featured story carousel on the homepage
│   ├── Icon.jsx            # SVG icon primitives (search, bookmark, sun, moon, etc.)
│   ├── Navbar.jsx          # Sticky top bar with search input, navigation & write button
│   ├── ShareButtons.jsx    # Web Share API and clipboard copy utility
│   ├── Thumb.jsx           # Dynamic category gradient placeholder thumbnails
│   ├── Ticker.jsx          # Breaking news marquee ticker
│   └── TrendingList.jsx    # Top trending sidebar list ordered by views
├── context/
│   ├── BookmarksContext.jsx # Global bookmark IDs state and toggle actions
│   └── ToastContext.jsx     # Ephemeral toast notifications (success/error alerts)
├── hooks/
│   ├── useBookmarks.js     # Syncs bookmark IDs with browser localStorage
│   └── useCategories.js    # Fetches and caches category counts from /api/categories
└── pages/
    ├── Article.jsx         # Full story view, metrics, source link, and related stories
    ├── Categories.jsx      # Category overview and category-filtered feed
    ├── Home.jsx            # Main dashboard: Ticker, Hero, Trending, Categories & Feed
    ├── Saved.jsx           # Saved stories list loaded from local storage IDs
    ├── Search.jsx          # Search results with live text search and sort controls
    ├── TopNews.jsx         # Ranked list of stories sorted by view count
    └── Write.jsx           # Submission form with live word counter & card preview
```

### 2.2 Backend (`server/src`)

The server follows a clean layered design separating transport, business logic, and storage:

```
server/src/
├── app.js               # Express app initialization, CORS, latency middleware, router mounts
├── index.js             # Server startup entry point and port listener
├── constants.js         # Supported categories (slugs & names), MAX_WORDS (50), MAX_TITLE_LENGTH (120)
├── routes/
│   └── articles.js      # REST route handlers for /api/articles
├── services/
│   └── articleService.js# Pure business logic: filtering, searching, sorting, pagination, validation
├── store/
│   ├── index.js         # getStore() factory dynamically resolving storage driver
│   ├── memoryStore.js   # Default in-memory array storage implementation
│   └── mongoStore.js    # Optional Mongoose/MongoDB implementation
├── data/
│   ├── seed.json        # Curated mock articles with relative hoursAgo timestamps
│   └── loadSeed.js      # Transforms hoursAgo into dynamic ISO publishedAt dates
└── utils/
    └── wordCount.js     # Regex-based word counter matching frontend behavior
```

---

## 3. Storage Layer Pattern

NewsNest uses the **Repository / Storage Driver Pattern**. Business logic and route handlers never interact directly with database drivers or arrays. Instead, they interact with an identical contract returned by `getStore()`:

| Method | Signature | Description |
|---|---|---|
| `getAll()` | `() => Promise<Article[]>` | Retrieves all articles in the system. |
| `getById(id)` | `(id: string) => Promise<Article \| null>` | Retrieves a single article by its unique ID. |
| `create(data)` | `(data: NewArticleInput) => Promise<Article>` | Persists a new article and assigns an ID, zero views, and timestamp. |
| `incrementViews(id)` | `(id: string) => Promise<Article \| null>` | Atomically increments view count by 1 and returns updated record. |

- If `process.env.MONGO_URI` is defined, `server/src/store/index.js` dynamically imports and connects `mongoStore.js`.
- If `process.env.MONGO_URI` is omitted (the default), `memoryStore.js` is loaded synchronously without connecting to any external network or database.

---

## 4. Key Application Data Flows

### 4.1 Page Load & Article Fetching

When a user visits the homepage (`/`), the client requests featured stories, trending stories, categories, and paginated latest stories:

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Browser as React App (Home.jsx)
  participant Proxy as Vite Proxy (Port 5173)
  participant Express as Express (Port 5000)
  participant Service as articleService.js
  participant Store as memoryStore / mongoStore

  User->>Browser: Opens http://localhost:5173
  Browser->>Proxy: GET /api/articles?category=all&page=1&limit=10
  Proxy->>Express: Forward to http://localhost:5000/api/articles...
  Express->>Store: store.getAll()
  Store-->>Express: Return all story records
  Express->>Service: listArticles(all, { category, q, sort, page, limit })
  Service->>Service: filterByCategory() -> searchArticles() -> sortArticles() -> paginate()
  Service-->>Express: Return { items, page, limit, total, hasMore }
  Express-->>Proxy: 200 OK (JSON)
  Proxy-->>Browser: 200 OK (JSON)
  Browser-->>User: Renders Hero, Trending list & Story Cards
```

### 4.2 Recording Story Views

When a user navigates to an article detail page (`/article/:id`), the client registers an atomic view:

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant ArticlePage as React App (Article.jsx)
  participant Express as Express (articlesRouter)
  participant Store as Storage Driver

  User->>ArticlePage: Clicks story card
  ArticlePage->>Express: GET /api/articles/a1
  Express->>Store: store.getById("a1")
  Store-->>Express: Article record
  Express-->>ArticlePage: 200 OK (Story JSON)
  ArticlePage->>Express: POST /api/articles/a1/view
  Express->>Store: store.incrementViews("a1")
  Store->>Store: Mutates article.views++
  Store-->>Express: Updated record
  Express-->>ArticlePage: 200 OK { id: "a1", views: 8421 }
  ArticlePage-->>User: Displays updated view counter
```

### 4.3 Submitting a Story (`/write`)

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant WritePage as React App (Write.jsx)
  participant Express as Express (articlesRouter)
  participant Service as articleService.validateNewArticle
  participant Store as Storage Driver

  User->>WritePage: Types headline & 50-word summary
  WritePage->>WritePage: Updates live counter (word count <= 50)
  User->>WritePage: Clicks "Publish 50-Word Story"
  WritePage->>Express: POST /api/articles with JSON body
  Express->>Service: validateNewArticle(req.body)
  alt Validation Fails (e.g. > 50 words)
    Service-->>Express: { errors: ["Summary must be 50 words or fewer."] }
    Express-->>WritePage: 400 Bad Request
    WritePage-->>User: Shows inline error message
  else Validation Passes
    Service-->>Express: { errors: [], value: sanitizedData }
    Express->>Store: store.create(value)
    Store->>Store: Assigns next ID ('a31'), views: 0, publishedAt: now()
    Store-->>Express: Newly created article object
    Express-->>WritePage: 201 Created (Article JSON)
    WritePage-->>User: Shows toast "Your story is live" & navigates to /article/a31
  end
```

---

## 5. State Management & Persistence

| State Concern | Implementation | Persistence Mechanism |
|---|---|---|
| **Articles & Categories** | React local component state (`useState`, `useEffect`) | Fetched from Express API (`/api/articles`, `/api/categories`). |
| **Bookmarks** | Global React Context (`BookmarksProvider` via `useBookmarks.js`) | Persisted in browser `window.localStorage` under key `newsnest:bookmarks`. |
| **Notifications** | Global Toast Context (`ToastProvider` via `ToastContext.jsx`) | In-memory ephemeral queue with auto-dismiss timers. |
| **Theme (Light / Dark)**| Stored in `localStorage` and applied via `document.documentElement.dataset.theme`. | Preserved across page reloads. |
