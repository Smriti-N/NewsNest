export function countWords(text = '') {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const words = trimmed.match(/\S+/g);
  return words ? words.length : 0;
}