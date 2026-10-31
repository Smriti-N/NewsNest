import { Router } from 'express';

const router = Router();
const subscribers = new Set();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function resetSubscribers() {
  subscribers.clear();
}

router.post('/', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const normalized = email.toLowerCase();
  if (subscribers.has(normalized)) {
    return res.status(409).json({ error: 'This email is already subscribed.' });
  }

  subscribers.add(normalized);
  return res.status(201).json({
    message: 'Subscribed to the daily digest!',
    count: subscribers.size,
  });
});

router.get('/count', (req, res) => {
  res.json({ count: subscribers.size });
});

export default router;

