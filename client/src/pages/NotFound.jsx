import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="not-found panel" aria-labelledby="not-found-title">
      <span className="not-found-code" aria-hidden="true">404</span>
      <h1 id="not-found-title">Page not found</h1>
      <p className="muted">
        We couldn’t find the page you’re looking for. The link may be outdated,
        or the address may have been typed incorrectly.
      </p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </section>
  );
}
