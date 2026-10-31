import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function NotFound() {
  return (
    <section className="not-found panel" style={{ textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '600px' }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '16px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Page not found</h2>
      <p className="muted" style={{ marginBottom: '24px' }}>
        The page you are looking for doesn't exist, has been moved, or the URL might have a typo.
      </p>
      <Link to="/" className="btn btn-primary">
        <Icon name="arrow-right" size={16} /> Back to Home
      </Link>
    </section>
  );
}

