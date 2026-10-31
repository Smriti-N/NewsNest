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
    // Show "Searching..." straight away so the old count / "No stories match"
    // message never sits next to text it doesn't belong to.
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const { signal } = controller;

    // Debounce: wait 300 ms after the last change before calling the API.
    const timer = setTimeout(() => {
      getArticles({ q, category, sort, limit: 20, signal })
        .then((res) => {
          if (signal.aborted) return; // a newer request replaced this one
          setResults(res.items);
          setTotal(res.total);
          setLoading(false);
        })
        .catch((e) => {
          if (signal.aborted || e.name === 'AbortError') return;
          setError(e.message);
          setLoading(false);
        });
    }, 300);

    // Runs when q/category/sort change again (or on unmount):
    // cancel the pending timer and the in-flight request.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
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