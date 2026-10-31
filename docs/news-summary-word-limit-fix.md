# NewsNest: 50-Word Summary Fix

## What was wrong

NewsNest promises that every story summary contains 50 words or fewer.
However, the client and server counted words differently:

- The server split text only on normal spaces.
- The client counted only word-like characters.

Because of this, summaries with words separated by line breaks or tabs could
pass server validation even when they contained more than 50 words. The client
counter could also show a different number from the server. For example,
`don't stop` was shown as 3 words instead of 2.

## How the problem was reproduced

1. Open **Write a story**.
2. Paste 60 words with one word on each line.
3. Click **Publish story**.
4. The story was accepted even though it exceeded the 50-word limit.
5. Type `don't stop`.
6. The counter displayed 3 words instead of 2.

## What was changed

### Server

The server word counter now treats a word as a run of non-whitespace
characters. It uses the pattern `\S+`, so spaces, repeated spaces, tabs, and
line breaks all separate words correctly.

The server now rejects summaries containing 51 or more words with HTTP 400 and
the message:

> Summary must be 50 words or fewer.

### Client

The Write a story page now uses the same `\S+` definition as the server.

The counter now:

- Shows `0` for empty or whitespace-only text.
- Ignores leading and trailing whitespace.
- Counts words separated by spaces, tabs, or line breaks correctly.
- Counts `don't` as one word.

The Publish button is disabled when the summary is empty, contains only
whitespace, or contains more than 50 words. This matches the server's
validation behavior.

### Tests

Regression tests were added for:

- Words separated by tabs and line breaks.
- Apostrophes such as `don't`.
- Leading, trailing, and whitespace-only text.
- A 51-word summary separated by line breaks.

## How the solution works

Both sides use the same simple rule:

```js
text.match(/\S+/g)?.length ?? 0
```

In plain language: find every continuous group of characters that is not
whitespace and count those groups.

This keeps the client counter and server validation consistent.

## Result

The 50-word rule can no longer be bypassed with unusual spacing. The number
shown while writing matches the number used when publishing, and invalid
summaries are blocked before submission and rejected by the server if they
still reach it.

## What is done

- Fixed server-side word counting.
- Fixed client-side word counting.
- Made the Publish button follow the same validation rule.
- Added regression tests.
- Verified the server tests pass.
- Verified the client production build passes.

## What is not included

- No changes were made to the article layout or design.
- No new database migration was needed.
- No changes were made to unrelated validation rules.
- The `docs/` folder is intentionally ignored by Git, so this explanation is
  for local use and presentations only.

## Simple explanation for a presentation

> NewsNest had one word-count rule in the browser and a different rule on the
> server. That meant users could submit long summaries by separating words
> with line breaks, and the counter could show the wrong number. We fixed this
> by defining a word as any group of non-whitespace characters and using that
> same rule in both places. Now the counter is accurate, summaries over 50
> words are rejected, and the Publish button is disabled for invalid
> summaries.
