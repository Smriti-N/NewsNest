// A word is a run of non-whitespace characters. The client counter in
// client/src/utils/wordCount.js uses the same definition, so both sides agree.
export function countWords(text = '') {
  const trimmed = String(text).trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
