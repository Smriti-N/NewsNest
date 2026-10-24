import { Link } from 'react-router-dom';
import useCategories from '../hooks/useCategories.js';
import Icon from './Icon.jsx';
import { CATEGORY_ICONS } from '../utils/categories.js';

export default function CategoryTiles({ active }) {
  const categories = useCategories();

  return (
    <div className="tiles">
      {categories.map((c) => (
        <Link
          key={c.slug}
          to={`/categories/${c.slug}`}
          className={`tile tile-${c.slug}${active === c.slug ? ' tile-active' : ''}`}
        >
          <span className="tile-icon">
            <Icon name={CATEGORY_ICONS[c.slug]} size={22} />
          </span>
          <span className="tile-name">{c.name}</span>
          <span className="tile-count">{c.count} stories</span>
        </Link>
      ))}
    </div>
  );
}
