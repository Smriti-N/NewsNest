import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="not-found-wrapper">
      <div className="empty not-found">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-text">
          The story or page you're looking for doesn't exist, has been removed, or the link is broken.
        </p>
        <Link to="/" className="btn btn-primary not-found-btn">
          Go Home
        </Link>
      </div>
    </section>
  );
}

