import { Router } from 'express';
import {
  validateEmail,
  addSubscriber,
  getSubscriberCount,
} from '../services/subscriberService.js';

const router = Router();

router.post('/', (req, res) => {
  const { email } = req.body || {};

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const result = addSubscriber(email);
  if (result.duplicate) {
    return res.status(409).json({ error: 'This email is already subscribed.' });
  }

  return res.status(201).json({
    message: 'Subscribed successfully.',
    email: result.email,
    count: getSubscriberCount(),
  });
});

router.get('/count', (req, res) => {
  res.json({ count: getSubscriberCount() });
});

export default router;
