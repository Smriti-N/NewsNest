import express from 'express';
import {
  subscribe,
  getSubscriberCount,
} from '../services/subscriptionService.js';

const router = express.Router();

router.post('/subscribe', (req, res) => {
  const result = subscribe(req.body?.email);

  if (!result.ok) {
    return res.status(result.status).json({
      error: result.message,
      message: result.message,
    });
  }

  return res.status(201).json({
    message: result.message,
    subscriber: result.subscriber,
  });
});

router.get('/subscribe/count', (_req, res) => {
  res.json({ count: getSubscriberCount() });
});

export default router;

