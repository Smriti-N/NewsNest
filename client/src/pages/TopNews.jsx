import { useEffect, useState } from 'react';
import { getTrending } from '../api.js';
import ArticleRow from '../components/ArticleRow.jsx';

export default function TopNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrending(10)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="page-title">Top news</h1>
      <p className="lead">The ten most-read stories right now</p>
      {loading && <p className="muted">Loading top stories...</p>}
      <div className="stack">
        {items.map((a, i) => (
          <ArticleRow key={a.id} article={a} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
