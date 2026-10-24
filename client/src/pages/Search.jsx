import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArticles } from '../api.js';
import useCategories from '../hooks/useCategories.js';
import ArticleRow from '../components/ArticleRow.jsx';
import Icon from '../components/Icon.jsx';

const SUGGESTIONS = ['solar', 'school', 'cricket', 'robot', 'comet'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const q = params.get('q') || '';
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'latest';

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function update(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      const isDefault = !value || value === 'all' || (key === 'sort' && value === 'latest');
      if (isDefault) p.delete(key);
      else p.set(key, value);
    });
    setParams(p, { replace: true });
  }

  useEffect(() => {
    setLoading(true);
    setError('');
    getArticles({ q, category, sort, limit: 20 })
      .then((res) => {
        setResults(res.items);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, category, sort]);

  return (
    <section>
      <h1 className="page-title">{q ? `Search results for \u201C${q}\u201D` : 'Search stories'}</h1>
      <p className="lead">
        {loading ? 'Searching...' : `${total} result${total === 1 ? '' : 's'} found`}
      </p>

      <div className="search-bar">
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Type to search headlines and summaries"
          aria-label="Search stories"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
          autoFocus
        />
      </div>

      <div className="filters">
        <label>
          Category
          <select value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="latest">Newest</option>
            <option value="popular">Most read</option>
          </select>
        </label>
        <div className="suggest">
          <span>Try:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => update({ q: s })}>{s}</button>
          ))}
        </div>
      </div>

      {error && <p className="notice notice-error">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="notice">No stories match your search. Try a different word or category.</p>
      )}
      <div className="stack">
        {results.map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
