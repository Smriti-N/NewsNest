// A word is a run of non-whitespace characters. The server uses the same
// definition in server/src/utils/wordCount.js, so the counter never disagrees.
export function countWords(text = '') {
  const trimmed = String(text).trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
