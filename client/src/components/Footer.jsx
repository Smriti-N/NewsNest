import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { subscribe } from '../api.js';
import Icon from './Icon.jsx';

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast('Please enter an email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      await subscribe(trimmed);
      toast('Subscribed! You will receive our daily digest.', 'success');
      setEmail('');
    } catch (err) {
      toast(err.message || 'Failed to subscribe.', 'error');
    } finally {
      setLoading(false);
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
          <h4>Daily digest</h4>
          <form className="subscribe" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              required
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              type="submit"
              aria-label="Subscribe"
              disabled={loading}
            >
              <Icon name="mail" size={16} />
            </button>
          </form>
          <p className="footer-note">One email a day with the top five stories.</p>
        </div>
      </div>
      <p className="footer-bottom">NewsNest. Every story, 50 words or fewer.</p>
    </footer>
  );
}
