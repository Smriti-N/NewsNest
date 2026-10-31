# NewsNest Troubleshooting Guide

A beginner-friendly guide to diagnosing and fixing the most common issues when installing, running, and developing NewsNest.

---

## Table of Contents

1. [Prerequisites & Node Version Errors](#1-prerequisites--node-version-errors)
2. [Installation & Dependency Issues](#2-installation--dependency-issues)
3. [Port Conflicts (`EADDRINUSE`)](#3-port-conflicts-eaddrinuse)
4. [Vite Proxy & Network Errors (`Failed to fetch`)](#4-vite-proxy--network-errors-failed-to-fetch)
5. [Intentional API Delay (`API_DELAY_MS`)](#5-intentional-api-delay-api_delay_ms)
6. [Storage & Database Issues (In-Memory vs MongoDB)](#6-storage--database-issues-in-memory-vs-mongodb)
7. [Bookmarks & Browser LocalStorage](#7-bookmarks--browser-localstorage)
8. [Article Submission Validation Errors](#8-article-submission-validation-errors)

---

## 1. Prerequisites & Node Version Errors

### Requirement
NewsNest requires **Node.js 18.11 or newer**.

### How to Check
Open your terminal and run:
```bash
node -v
```

### Symptom: `node: --watch is not allowed` or `SyntaxError: Unexpected token 'export'`
- **Cause**: Older versions of Node.js (v16 or earlier v18 releases) do not support the native `--watch` flag used in `server/package.json` (`node --watch src/index.js`), or native ES module features.
- **Fix**: Upgrade Node.js to LTS (v20+ or v22+ recommended):
  - **Windows / macOS**: Download from [nodejs.org](https://nodejs.org/).
  - **Using nvm (macOS / Linux)**:
    ```bash
    nvm install 20
    nvm use 20
    ```
  - **Using nvm-windows**:
    ```bash
    nvm install 20.18.0
    nvm use 20.18.0
    ```

---

## 2. Installation & Dependency Issues

### How NewsNest Workspaces Work
NewsNest uses **npm workspaces**. The root `package.json` defines two workspaces:
- `client` (Vite + React)
- `server` (Express API)

### Symptom: `npm run dev` fails with `concurrently: command not found`
- **Cause**: You ran `npm install` inside only `client/` or `server/`, but not at the root level where `concurrently` is installed.
- **Fix**: Always run `npm install` from the **project root directory**:
  ```bash
  cd NewsNest
  npm install
  ```

### Symptom: `EPERM: operation not permitted` on Windows
- **Cause**: Windows file locking (often caused by an open terminal process, VS Code file watcher, or antivirus scanner).
- **Fix**:
  1. Stop any running dev servers (`Ctrl + C`).
  2. Close any editor tabs that might be locking `node_modules`.
  3. Re-run `npm install`.

---

## 3. Port Conflicts (`EADDRINUSE`)

NewsNest uses two ports by default:
- **Port 5000**: Express API server
- **Port 5173**: Vite frontend dev server

### Symptom: `Error: listen EADDRINUSE: address already in use :::5000`
- **Cause**: Another program (such as Docker, a previous Node process, or another dev server) is already listening on port 5000.
- **Fix Option A — Terminate the conflicting process**:
  - **Windows (PowerShell)**:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
    ```
  - **macOS / Linux**:
    ```bash
    lsof -ti :5000 | xargs kill -9
    ```
- **Fix Option B — Change the backend port**:
  1. Copy `server/.env.example` to `server/.env`:
     ```bash
     cp server/.env.example server/.env
     ```
  2. Change the `PORT` variable in `server/.env`:
     ```env
     PORT=5001
     ```
  3. Update the proxy target in `client/vite.config.js`:
     ```javascript
     export default defineConfig({
       plugins: [react()],
       server: {
         port: 5173,
         proxy: {
           '/api': 'http://localhost:5001', // Update to match PORT
         },
       },
     });
     ```

---

## 4. Vite Proxy & Network Errors (`Failed to fetch`)

### Symptom: Red toast notification: `Failed to fetch` or empty page with spinning loaders
- **Cause**: The Vite frontend at `http://localhost:5173` is running, but the Express server at `http://localhost:5000` is either stopped, crashed, or unreachable.
- **How Vite connects**:
  The client does not make absolute requests like `fetch("http://localhost:5000/api/articles")`. Instead, it requests `/api/articles`. Vite's development server proxies all `/api/*` calls directly to `http://localhost:5000`.
- **Fix**:
  1. Verify the server is running by opening `http://localhost:5000/api/health` directly in your browser.
     - Expected response: `{"status":"ok"}`.
  2. If the health check fails, check the server terminal console output for errors.
  3. Restart both servers from the root directory using:
     ```bash
     npm run dev
     ```

---

## 5. Intentional API Delay (`API_DELAY_MS`)

### Symptom: API requests feel slightly delayed (~700ms)
- **Explanation**: **This is an intentional feature, not a bug!**
  To make frontend loading skeletons, spinners, and async transitions visible and testable on fast local machines, the server adds a random delay (up to 700ms) by default:
  ```javascript
  // server/src/app.js
  const MAX_DELAY = Number(process.env.API_DELAY_MS ?? 700);
  app.use('/api', (req, res, next) => {
    setTimeout(next, Math.random() * MAX_DELAY);
  });
  ```
- **How to turn it off**:
  If you want instant responses:
  1. In `server/.env` (created from `server/.env.example`), set:
     ```env
     API_DELAY_MS=0
     ```
  2. The server will restart automatically (via `node --watch`) and respond without artificial latency.

---

## 6. Storage & Database Issues (In-Memory vs MongoDB)

### Storage Modes Explained
NewsNest supports two interchangeable storage backends:
1. **In-Memory Store (Default)**: Zero setup, no database required.
2. **MongoDB Store (Optional)**: Persistent storage using Mongoose.

### Symptom: Stories added via `/write` disappear after restarting the server
- **Explanation**: This is the expected behavior of the default **in-memory store** (`server/src/store/memoryStore.js`).
- Data lives purely in Node.js process RAM and initializes from `server/src/data/seed.json` on boot. Whenever the server restarts, data safely resets to the original seed.

### Symptom: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause**: `MONGO_URI` is active in `server/.env`, but your local MongoDB server is not running or the URI is incorrect.
- **Fix**:
  - If you **do not** need MongoDB: Comment out or remove `MONGO_URI` in `server/.env`. NewsNest will immediately fall back to the zero-dependency in-memory mode:
    ```env
    # MONGO_URI=mongodb://127.0.0.1:27017/newsnest
    ```
  - If you **do** want MongoDB: Start your MongoDB service:
    - **Windows**: `net start MongoDB` or start MongoDB service from `services.msc`.
    - **macOS (Homebrew)**: `brew services start mongodb-community`.
    - **Linux (systemd)**: `sudo systemctl start mongod`.

---

## 7. Bookmarks & Browser LocalStorage

### Symptom: Bookmarks remain after server restart, or bookmarks don't sync across browsers
- **Explanation**: Bookmarks are saved entirely client-side in the browser's `localStorage` under the key `newsnest:bookmarks`.
- Bookmarks do not touch the server API. They persist across page reloads and server restarts on that specific browser.
- **How to reset bookmarks**:
  - Navigate to `/saved` in the app and click the **"Clear all"** button.
  - Or open browser DevTools (`F12`), go to **Application > Local Storage > http://localhost:5173**, and delete the `newsnest:bookmarks` key.

---

## 8. Article Submission Validation Errors

When posting a new story at `/write` (`POST /api/articles`), the server validates inputs strictly:

| Error Message | Cause | Resolution |
|---|---|---|
| `Title is required.` | Title input was left blank or empty whitespace. | Provide a headline. |
| `Title must be 120 characters or fewer.` | Headline exceeds the 120-character limit. | Shorten the headline. |
| `Summary is required.` | Summary field was left blank. | Write a summary. |
| `Summary must be 50 words or fewer.` | Word count exceeds 50 words. | Watch the live counter on `/write`. Trim words until the badge turns green. |
| `Pick a valid category.` | Provided category is not in `CATEGORY_SLUGS`. | Select one of: `technology`, `business`, `sports`, `politics`, `health`, `science`, `entertainment`, `world`, `india`. |

---

## Need More Help?

If you encounter an issue not covered in this guide:
1. Inspect the browser console (`F12` > **Console**) for frontend errors.
2. Inspect the terminal running `npm run dev` for backend stack traces.
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand how components communicate.
4. Check [API.md](API.md) for endpoint specifications and error responses.
