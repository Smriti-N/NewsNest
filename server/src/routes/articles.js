import { Router } from 'express';
import { getStore } from '../store/index.js';
import {
  listArticles,
  getTrending,
  getFeatured,
  getRelated,
  validateNewArticle,
} from '../services/articleService.js';

const router = Router();

// Track active Server-Sent Events (SSE) client connections
let clients = [];

function broadcastNewArticle(article) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(article)}\n\n`);
  });
}

// 1. Live SSE Stream endpoint (MUST be placed BEFORE /:id route)
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
  });
});

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

    // Broadcast the new story to all active tabs
    broadcastNewArticle(created);

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;