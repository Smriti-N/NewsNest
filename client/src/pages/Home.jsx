import { useEffect, useRef, useState } from 'react';
import { getArticles, subscribeToStories } from '../api.js';
import Ticker from '../components/Ticker.jsx';
import Hero from '../components/Hero.jsx';
import TrendingList from '../components/TrendingList.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import CategoryTiles from '../components/CategoryTiles.jsx';
import ArticleCard from '../components/ArticleCard.jsx';

const PAGE_SIZE = 9;

export default function Home() {
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState([]);
  const shownIds = useRef(new Set());

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getArticles({ category, sort: 'latest', page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (ignore) return;
        setItems(res.items);
        setHasMore(res.hasMore);
        setPage(1);
      })
      .catch((e) => !ignore && setError(e.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [category]);

  // Keep a live connection open and collect stories published elsewhere.
  useEffect(() => {
    setPending([]);
    return subscribeToStories((article) => {
      if (category !== 'all' && article.category !== category) return;
      if (shownIds.current.has(article.id)) return;
      setPending((prev) => (prev.some((a) => a.id === article.id) ? prev : [article, ...prev]));
    });
  }, [category]);

  useEffect(() => {
    shownIds.current = new Set(items.map((a) => a.id));
  }, [items]);

  function showPending() {
    setItems((prev) => [...pending.filter((a) => !shownIds.current.has(a.id)), ...prev]);
    setPending([]);
  }

  async function loadMore() {
    const next = page + 1;
    try {
      const res = await getArticles({ category, sort: 'latest', page: next, limit: PAGE_SIZE });
      // New stories shift the pages, so skip anything already on screen.
      setItems((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...res.items.filter((a) => !seen.has(a.id))];
      });
      setHasMore(res.hasMore);
      setPage(next);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <Ticker />

      <div className="home-top">
        <Hero />
        <TrendingList limit={5} />
      </div>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Latest news</h2>
        </div>
        <CategoryChips active={category} onChange={setCategory} />

        {/* TODO: show a loading indicator here while `loading` is true */}

        {pending.length > 0 && (
          <button className="new-stories" onClick={showPending}>
            {pending.length} new {pending.length === 1 ? 'story' : 'stories'}, click to load
          </button>
        )}

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

        {!loading && hasMore && (
          <button className="btn btn-outline btn-block" onClick={loadMore}>
            Load more stories
          </button>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Explore topics</h2>
        </div>
        <CategoryTiles />
      </section>
    </>
  );
}
