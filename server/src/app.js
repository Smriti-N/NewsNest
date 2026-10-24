import express from 'express';
import cors from 'cors';
import articlesRouter from './routes/articles.js';
import { getStore } from './store/index.js';
import { categoryCounts } from './services/articleService.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simulated network latency so loading states are easy to see.
const MAX_DELAY = Number(process.env.API_DELAY_MS ?? 700);
app.use('/api', (req, res, next) => {
  setTimeout(next, Math.random() * MAX_DELAY);
});

app.get('/api/categories', async (req, res, next) => {
  try {
    const store = await getStore();
    res.json(categoryCounts(await store.getAll()));
  } catch (err) {
    next(err);
  }
});

app.use('/api/articles', articlesRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
