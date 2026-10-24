import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArticles } from '../api.js';
import CategoryTiles from '../components/CategoryTiles.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import { categoryName } from '../utils/categories.js';

export default function Categories() {
  const { slug } = useParams();
  const selected = slug || 'technology';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getArticles({ category: selected, sort: 'latest', limit: 12 })
      .then((res) => !ignore && setItems(res.items))
      .catch((e) => !ignore && setError(e.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [selected]);

  return (
    <section>
      <h1 className="page-title">Categories</h1>
      <p className="lead">Browse news by category</p>
      <CategoryTiles active={selected} />

      <h2 className="section-title section-gap">{categoryName(selected)} news</h2>
      {loading && <p className="muted">Loading stories...</p>}
      {error && <p className="notice notice-error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="notice">No stories in this category yet.</p>
      )}
      {!loading && (
        <div className="grid">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}
