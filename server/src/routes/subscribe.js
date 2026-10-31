import { Router } from 'express';
import {
  validateEmail,
  addSubscriber,
  countSubscribers,
} from '../services/subscriberService.js';

const router = Router();

router.post('/', (req, res) => {
  const { email, error } = validateEmail(req.body);
  if (error) return res.status(400).json({ error });
  if (!addSubscriber(email))
    return res.status(409).json({ error: 'This email is already subscribed.' });
  res.status(201).json({ message: 'Subscribed', email });
});

router.get('/count', (req, res) => {
  res.json({ count: countSubscribers() });
});

export default router;