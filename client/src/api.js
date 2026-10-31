async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
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

export function getArticles({ category, q, sort, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (q) params.set('q', q);
  if (sort) params.set('sort', sort);
  params.set('page', page);
  params.set('limit', limit);
  return request(`/articles?${params}`);
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

export async function subscribeToDailyDigest(email) {
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Subscription failed.');
  }

  return data;
}

export async function getSubscriberCount() {
  const response = await fetch('/api/subscribe/count');

  if (!response.ok) {
    throw new Error('Could not load subscriber count.');
  }

  return response.json();
}
