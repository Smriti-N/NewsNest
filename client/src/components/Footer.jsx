import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { subscribeToDailyDigest } from '../api.js';

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setStatus({ type: 'idle', message: '' });
    setSubmitting(true);

    try {
      const result = await subscribeToDailyDigest(email);
      const message = result.message || 'You are subscribed to the Daily Digest.';
      setStatus({
        type: 'success',
        message,
      });
      toast(message, 'success');
      setEmail('');
    } catch (error) {
      const message = error.message || 'Subscription failed.';
      setStatus({
        type: 'error',
        message,
      });
      toast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Link to="/" className="brand brand-footer">
            <span className="brand-mark">N</span>
            <span className="brand-name">NewsNest</span>
          </Link>
          <p className="footer-blurb">
            The news in 50 words or fewer. Quick, clear and easy to catch up on.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/top">Top News</Link>
          <Link to="/saved">Saved</Link>
        </div>
        <div>
          <h4>Topics</h4>
          <Link to="/categories/technology">Technology</Link>
          <Link to="/categories/business">Business</Link>
          <Link to="/categories/sports">Sports</Link>
          <Link to="/categories/science">Science</Link>
        </div>
        <div>
          <h4>
            <label htmlFor="daily-digest-email">Daily Digest</label>
          </h4>
          <form className="subscribe" onSubmit={handleSubmit}>
            <input
              id="daily-digest-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              required
              disabled={submitting}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !email.trim()}
            >
              {submitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className="footer-note">One email a day with the top five stories.</p>
        </div>
      </div>
      <p className="footer-bottom">NewsNest. Every story, 50 words or fewer.</p>
    </footer>
  );
}
