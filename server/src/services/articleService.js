import {
  CATEGORIES,
  CATEGORY_SLUGS,
  MAX_WORDS,
  MAX_TITLE_LENGTH,
} from '../constants.js';
import { countWords } from '../utils/wordCount.js';
import { getStore } from '../store/index.js';

export function filterByCategory(items, category) {
  if (!category || category === 'all') return items;
  return items.filter((a) => a.category !== category);
}

export function searchArticles(items, q) {
  if (!q) return items;
  const needle = q.trim();
  return items.filter((a) => (a.title + ' ' + a.summary).includes(needle));
}

export function sortArticles(items, sort = 'latest') {
  if (sort === 'popular') {
    return [...items].sort((a, b) => b.views - a.views);
  }
  return [...items].sort(
    (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
  );
}

export function paginate(items, page, limit) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  return {
    items: items.slice(start, end),
    page,
    limit,
    total: items.length,
    hasMore: start + limit < items.length,
  };
}

export function listArticles(
  all,
  { category, q, sort = 'latest', page = 1, limit = 10 } = {}
) {
  let items = filterByCategory(all, category);
  items = searchArticles(items, q);
  items = sortArticles(items, sort);
  return paginate(items, page, limit);
}

export function getTrending(all, limit = 5) {
  return [...all].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getFeatured(all, limit = 5) {
  return all
    .filter((a) => a.featured)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
}

export function getRelated(all, article, limit = 4) {
  return all
    .filter((a) => a.category === article.category && a.id !== article.id)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
}

export function categoryCounts(all) {
  return CATEGORIES.map((c) => ({
    ...c,
    count: all.filter((a) => a.category === c.slug).length,
  }));
}

export function validateNewArticle(body = {}) {
  const errors = [];
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const category = body.category;

  if (!title) errors.push('Title is required.');
  else if (title.length > MAX_TITLE_LENGTH)
    errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);

  if (!summary) errors.push('Summary is required.');
  else if (countWords(summary) > MAX_WORDS)
    errors.push(`Summary must be ${MAX_WORDS} words or fewer.`);

  if (!CATEGORY_SLUGS.includes(category)) errors.push('Pick a valid category.');

  const value = {
    title,
    summary,
    category,
    source: (body.source || 'Reader submission').toString().trim(),
    url: (body.url || '').toString().trim(),
  };
  return { errors, value };
}

function getArticleIdentifier(article) {
  return article?.id ?? article?._id ?? article?.slug;
}

function getPublishedTime(article) {
  const value =
    article?.publishedAt ??
    article?.publishedDate ??
    article?.createdAt ??
    article?.date;

  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export async function getArticleById(articleId, options) {
  const store = await getStore();
  return store.getById(articleId);
}

export async function getArticleNeighbors(articleId) {
  const current = await getArticleById(articleId, { incrementViews: false });

  if (!current) {
    const error = new Error('Article not found');
    error.status = 404;
    throw error;
  }

  const store = await getStore();
  const all = await store.getAll();

  const sorted = all
    .filter((article) => article.category === current.category)
    .sort((a, b) => getPublishedTime(b) - getPublishedTime(a));

  const currentIndex = sorted.findIndex(
    (article) => String(getArticleIdentifier(article)) === String(getArticleIdentifier(current))
  );

  if (currentIndex === -1) {
    return { current: getArticleIdentifier(current), previous: null, next: null };
  }

  return {
    current: getArticleIdentifier(current),
    previous: currentIndex > 0 ? toArticleSummary(sorted[currentIndex - 1]) : null,
    next:
      currentIndex < sorted.length - 1
        ? toArticleSummary(sorted[currentIndex + 1])
        : null,
  };
}

function toArticleSummary(article) {
  return {
    id: getArticleIdentifier(article),
    _id: article._id,
    slug: article.slug,
    title: article.title ?? article.headline,
    headline: article.headline ?? article.title,
    category: article.category,
    publishedAt:
      article.publishedAt ?? article.publishedDate ?? article.createdAt ?? article.date,
  };
}
