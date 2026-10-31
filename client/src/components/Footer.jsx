import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import Icon from './Icon.jsx';
import { useState } from 'react';
import { subscribe } from '../api.js';

export default function Footer() {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubscribe(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await subscribe(email);
      toast('Subscribed! Your daily digest is on its way.', 'success');
      setEmail('');
    } catch (err) {
      toast(err.message || 'Could not subscribe. Please try again.', 'error');
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
          <h4>Daily digest</h4>
          <form className="subscribe" onSubmit={handleSubscribe} noValidate>
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            <button className="btn btn-primary" type="submit" aria-label="Subscribe" disabled={submitting}>
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
