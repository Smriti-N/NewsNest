# Contributing to NewsNest

Thanks for joining Hack Day! This guide shows how to go from "I picked an issue" to "I opened a pull request".

## How it works

- Every issue has exactly one tag: **documentation**, **beginner** or **hard**. The tag decides the base points.
- Your team forks the repo, fixes issues, and opens pull requests (PRs).
- **PRs are never merged.** The source repo stays exactly as published so every team starts from the same code.
- Several teams can solve the same issue. Each PR is judged on its own.
- Issues are independent. You never need another issue to be fixed first.

## Step by step

1. **Fork** this repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
3. **Install and run** (see the README):
   ```bash
   npm install
   npm run dev
   ```
4. **Create a branch** named after the issue:
   ```bash
   git checkout -b fix/issue-12-short-description
   ```
5. **Make your change.** Keep it focused on one issue.
6. **Check that the app still runs** and that you can see your fix in the browser.
7. **Commit and push:**
   ```bash
   git add .
   git commit -m "Fix: short description of the change"
   git push origin fix/issue-12-short-description
   ```
8. **Open a pull request against `main`** of the original repo. Fill in the PR template and include `Closes #<issue-number>` in the description.

## Rules

- One PR per team per issue. If a team opens two PRs for the same issue, the later one counts.
- Only PRs opened before the cut-off time announced by the organisers are scored.
- Do not copy another team's PR. A copied PR scores 0.
- Do not make unrelated edits, reformat whole files, or commit `node_modules`.
- Do not add anything that needs a paid service, API key or Docker.

## How PRs are scored

Every issue has exactly one tag:

| Tag | Points | Expected time |
| --- | --- | --- |
| `documentation` | 1 | under 20 min |
| `beginner` | 10 | under 40 min |
| `hard` | 20 | 1- 3 hours |

Judges look at: does it solve the issue, is the change clean and small, did you test it, is the PR description clear.

## Good PR descriptions

- A clear title that says what you changed
- `Closes #N` so the issue is linked
- A short explanation of the cause and your fix
- A before and after screenshot for anything visible

## Need help?

Ask a volunteer or organiser in the room.
