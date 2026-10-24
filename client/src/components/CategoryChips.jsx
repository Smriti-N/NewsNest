import useCategories from '../hooks/useCategories.js';
import Icon from './Icon.jsx';
import { CATEGORY_ICONS } from '../utils/categories.js';

export default function CategoryChips({ active, onChange }) {
  const categories = useCategories();

  return (
    <div className="chips" role="tablist" aria-label="Categories">
      {[{ slug: 'all', name: 'All' }, ...categories].map((c) => (
        <button
          key={c.slug}
          role="tab"
          aria-selected={active === c.slug}
          className={`chip${active === c.slug ? ' chip-active' : ''}`}
          onClick={() => onChange(c.slug)}
        >
          <Icon name={CATEGORY_ICONS[c.slug] || 'grid'} size={15} />
          {c.name}
        </button>
      ))}
    </div>
  );
}
