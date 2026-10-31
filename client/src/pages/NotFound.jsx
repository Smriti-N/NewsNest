import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="empty">
      <span className="tag">404 Error</span>

      <h1 className="page-title">Page not found</h1>

      <p>
        Sorry, the page you're looking for doesn't exist
        or may have been moved.
      </p>

      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </section>
  );
}