import { Router } from 'express';
import { subscribe, subscriberCount } from '../services/subscriberService.js';

const router = Router();

router.post('/', (req, res) => {
  const { status, body } = subscribe(req.body?.email);
  res.status(status).json(body);
});

router.get('/count', (req, res) => {
  res.json({ count: subscriberCount() });
});

export default router;
