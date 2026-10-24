import { useEffect, useState } from 'react';
import { getTrending } from '../api.js';
import ArticleRow from './ArticleRow.jsx';
import Icon from './Icon.jsx';

export default function TrendingList({ limit = 5 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getTrending(limit).then(setItems).catch(() => setItems([]));
  }, [limit]);

  return (
    <aside className="panel">
      <h2 className="panel-title">
        <Icon name="trending" size={18} /> Trending now
      </h2>
      {items.length === 0 && <p className="muted">Loading trending stories...</p>}
      {items.map((a, i) => (
        <ArticleRow key={a.id} article={a} rank={i + 1} compact />
      ))}
    </aside>
  );
}
