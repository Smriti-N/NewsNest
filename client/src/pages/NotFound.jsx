import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function NotFound() {
  return (
    <section className="empty">
      <Icon name="search" size={36} />
      <h1 className="page-title">404: Page not found</h1>
      <p>We couldn't find the page you were looking for. It may have moved or never existed.</p>
      <Link to="/" className="btn btn-primary">Back to the home page</Link>
    </section>
  );
}
