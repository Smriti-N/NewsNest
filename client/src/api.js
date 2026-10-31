async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
  if (options?.signal?.aborted) {
    const err = new DOMException('The operation was aborted.', 'AbortError');
    throw err;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.error || data?.errors?.join(' ') || 'Something went wrong.';
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function getArticles({ category, q, sort, page = 1, limit = 10, signal } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (q) params.set('q', q);
  if (sort) params.set('sort', sort);
  params.set('page', page);
  params.set('limit', limit);
  return request(`/articles?${params}`, { signal });
}

export const getFeatured = () => request('/articles/featured');
export const getTrending = (limit = 5) => request(`/articles/trending?limit=${limit}`);
export const getArticle = (id) => request(`/articles/${id}`);
export const getRelated = (id) => request(`/articles/${id}/related`);
export const recordView = (id) => request(`/articles/${id}/view`, { method: 'POST' });
export const getCategories = () => request('/categories');

export function createArticle(body) {
  return request('/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
