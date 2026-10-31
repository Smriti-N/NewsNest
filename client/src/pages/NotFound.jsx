import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <div className="empty">
        <h1 className="page-title" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          404
        </h1>
        <h2>Page not found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}

