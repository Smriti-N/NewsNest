export function countWords(text = '') {
  return (text.match(/\S+/g) ?? []).length;
}
