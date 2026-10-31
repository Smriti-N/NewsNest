import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArticles } from '../api.js';
import useCategories from '../hooks/useCategories.js';
import ArticleRow from '../components/ArticleRow.jsx';
import Icon from '../components/Icon.jsx';

const SUGGESTIONS = ['solar', 'school', 'cricket', 'robot', 'comet'];
const DEBOUNCE_MS = 300;

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

  // Tracks the latest request so stale responses are ignored
  const requestIdRef = useRef(0);
  // Holds the AbortController for the in-flight request
  const abortRef = useRef(null);
  // Holds the debounce timer
  const timerRef = useRef(null);

  function update(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      const isDefault = !value || value === 'all' || (key === 'sort' && value === 'latest');
      if (isDefault) p.delete(key);
      else p.set(key, value);
    });
    setParams(p, { replace: true });
  }

  const fetchResults = useCallback((searchQ, searchCategory, searchSort) => {
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    // Increment request ID — only the latest request may update state
    const id = ++requestIdRef.current;

    setLoading(true);
    setError('');

    getArticles({ q: searchQ, category: searchCategory, sort: searchSort, limit: 20, signal: controller.signal })
      .then((res) => {
        // Only apply if this is still the latest request
        if (id !== requestIdRef.current) return;
        setResults(res.items);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((e) => {
        // Ignore aborted requests entirely
        if (e.name === 'AbortError') return;
        if (id !== requestIdRef.current) return;
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Clear any pending debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounce: wait DEBOUNCE_MS before firing the request
    timerRef.current = setTimeout(() => {
      fetchResults(q, category, sort);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [q, category, sort, fetchResults]);

  // Cleanup: abort in-flight request on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

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
