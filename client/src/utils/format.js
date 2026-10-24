export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatViews(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function readTime(text = '') {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const secs = Math.max(5, Math.round(words / 3.3));
  return `${secs} sec read`;
}
