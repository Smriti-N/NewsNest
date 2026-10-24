import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrending } from '../api.js';
import Icon from './Icon.jsx';

export default function Ticker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getTrending(6).then(setItems).catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="ticker" aria-label="Breaking news">
      <span className="ticker-label">
        <Icon name="zap" size={14} />
        Breaking
      </span>
      <div className="ticker-window">
        <div className="ticker-track">
          {loop.map((a, i) => (
            <Link key={`${a.id}-${i}`} to={`/article/${a.id}`} className="ticker-item">
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
