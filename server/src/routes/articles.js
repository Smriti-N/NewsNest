import { Router } from 'express';
import { getStore } from '../store/index.js';
import * as articleService from '../services/articleService.js';

const {
  listArticles,
  getTrending,
  getFeatured,
  getRelated,
  validateNewArticle,
  getArticleNeighbors,
} = articleService;

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const store = await getStore();
    const all = await store.getAll();
    res.json(
      listArticles(all, {
        category: req.query.category,
        q: req.query.q,
        sort: req.query.sort,
        page: Number(req.query.page) || 1,
        limit: Math.min(Number(req.query.limit) || 10, 100),
      })
    );
  } catch (err) {
    next(err);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const store = await getStore();
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    res.json(getTrending(await store.getAll(), limit));
  } catch (err) {
    next(err);
  }
});

router.get('/featured', async (req, res, next) => {
  try {
    const store = await getStore();
    res.json(getFeatured(await store.getAll()));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const store = await getStore();
    const article = await store.getById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Story not found' });
    res.json(article);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/neighbors', async (req, res) => {
  try {
    const navigation = await articleService.getArticleNeighbors(req.params.id);
    res.json(navigation);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || 'Could not load article navigation.',
    });
  }
});

router.get('/:id/navigation', async (req, res, next) => {
  try {
    const navigation = await articleService.getArticleNeighbors(req.params.id);
    res.json(navigation);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || 'Could not load article navigation.',
    });
  }
});

router.get('/:id/related', async (req, res, next) => {
  try {
    const store = await getStore();
    const article = await store.getById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Story not found' });
    res.json(getRelated(await store.getAll(), article));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/view', async (req, res, next) => {
  try {
    const store = await getStore();
    const article = await store.incrementViews(req.params.id);
    if (!article) return res.status(404).json({ error: 'Story not found' });
    res.json({ id: article.id, views: article.views });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { errors, value } = validateNewArticle(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const store = await getStore();
    const created = await store.create(value);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
