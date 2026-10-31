# NewsNest

**The news in 50 words or fewer.**

NewsNest is a news-in-short app. Every story is a card with a headline, a summary of at most 50 words, and a link to the full article. Browse a featured carousel and a trending list, explore by category, search, save stories for later, or write one of your own.

Built with the MERN stack (MongoDB, Express, React, Node). It runs **without any database or login** by default, so you can be up and running in two commands.

> **Hack Day project.** This repo is deliberately incomplete: some things are broken and some features are missing. Each one is a GitHub issue. Pick one, fix it, and open a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Features

- Breaking-news ticker and a featured story carousel
- Trending list, latest news grid with category filters and "Load more"
- Category pages, a Top News ranking and story pages with related news
- Search with category and sort filters
- Save stories to read later (stored in your browser)
- Write your own story, with a live word counter and preview
- Share buttons, dark mode and a responsive layout

## Tech stack

| Part | What we use |
| --- | --- |
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express |
| Data | In-memory store by default. MongoDB through Mongoose is optional. |

## Run it

You need **Node.js 18.11 or newer**.

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**. The API runs on http://localhost:5000.

That is all. No database, login, API key or Docker needed.

### Optional settings

Copy `server/.env.example` to `server/.env` to change any of these:

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` | `5000` | Port for the API |
| `MONGO_URI` | empty | Leave empty and NewsNest never connects to a database: stories live in memory and reset when the server restarts. Set it only if you want to store stories in MongoDB. |
| `API_DELAY_MS` | `700` | Adds a random delay of up to this many milliseconds to every API call, to imitate a slow network. Set `0` to turn it off. |

## Troubleshooting

Something not working? Find the message you see, then try the fix.

### `Error: listen EADDRINUSE: address already in use :::5000`

**Symptom:** The `[server]` lines in the terminal show this error, followed by `Failed running 'src/index.js'. Waiting for file changes before restarting...`. The app opens but no stories load.

**Fix:** Something else is already using port 5000.

1. See what it is:
   ```bash
   lsof -nP -iTCP:5000 -sTCP:LISTEN
   ```
   On Windows: `netstat -ano | findstr :5000`.
2. If it is an old NewsNest server (`node`), stop it with `kill <PID>` (Windows: `taskkill /PID <PID> /F`).
3. **On a Mac**, the process is usually `ControlCe` (Control Center). That is **AirPlay Receiver**, which uses port 5000. Turn it off in **System Settings → General → AirDrop & Handoff → AirPlay Receiver**, or run the API on another port (next step).
4. To use another port, create `server/.env` with `PORT=5050`, change the proxy target in `client/vite.config.js` to `http://localhost:5050`, and restart `npm run dev`.

The same idea applies if Vite says `Port 5173 is in use`: stop the old `npm run dev`, or let Vite pick the next free port and open the URL it prints.

### The page loads but stories never appear, or say "Something went wrong."

**Symptom:** The navbar and footer show, but the Latest news area stays empty or shows an error. In the terminal, the `[client]` lines show `[vite] http proxy error: /api/articles` with `ECONNREFUSED`.

**Fix:** The React app is running but the API is not answering.

1. Check the API directly:
   ```bash
   curl http://localhost:5000/api/health
   ```
   You should see `{"status":"ok"}`.
2. If the connection is refused, scroll up in the terminal for the `[server]` error (often the port problem above) and fix it.
3. If you get `403 Forbidden` with `Server: AirTunes`, AirPlay Receiver owns port 5000. See the port fix above.
4. Make sure you started the app with `npm run dev` **from the repo root**. Running `npm run dev` inside `client/` starts only the website, not the API.

### `sh: concurrently: command not found` (or `vite: command not found`)

**Symptom:** `npm run dev` stops immediately with this message.

**Fix:** Dependencies are not installed yet. Run this from the repo root (not inside `client/` or `server/`), then try again:

```bash
npm install
```

### `node: bad option: --watch`

**Symptom:** The `[server]` part of `npm run dev` stops straight away with this message, or `npm install` warns about `EBADENGINE`.

**Fix:** Your Node.js is too old. NewsNest needs **Node.js 18.11 or newer**. Check with:

```bash
node -v
```

Install the current LTS release from https://nodejs.org (or with `nvm install --lts`), open a new terminal, and run `npm install` again.

### `npm install` fails

**Symptom:** `npm install` ends with `npm ERR!` lines, for example `EACCES`, `ETIMEDOUT`, `ERESOLVE` or `EBADENGINE`.

**Fix:**

- `EBADENGINE`: update Node.js (see the previous problem).
- `ETIMEDOUT` / `ECONNRESET`: a network or proxy problem. Check your internet connection, try another network, then run `npm install` again.
- `EACCES` (permission denied): don't use `sudo`. Make sure you own the project folder, and fix npm's cache with `npm cache verify`.
- Anything else: delete the installed packages and start clean (next problem).

### Strange errors after pulling changes or switching branches

**Symptom:** Errors like `Cannot find module`, `Failed to resolve import`, or the app behaving differently from your teammates' copy.

**Fix:** Your `node_modules` folders are out of date. Remove them and reinstall from the repo root:

```bash
rm -rf node_modules client/node_modules server/node_modules
```

```bash
npm install
```

On Windows PowerShell, use `Remove-Item -Recurse -Force node_modules, client/node_modules, server/node_modules` instead of the `rm` command. Don't delete `package-lock.json`.

### Resetting the stories

By default, stories live in memory. To get back to the original 30 seed stories (and remove everything you published), stop `npm run dev` with Ctrl+C and start it again. If you set `MONGO_URI`, stories are kept in MongoDB instead; drop the `articles` collection to re-seed it.

## Project layout

```
newsnest/
  client/   React app (Vite)
  server/   Express API
  .github/  Pull request template
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for how to fork, branch and open a pull request.

## License

[MIT](LICENSE)
