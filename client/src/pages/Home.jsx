import { useEffect, useState } from 'react';
import { getArticles } from '../api.js';
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

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getArticles({ category, sort: 'latest', page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (ignore) return;
        console.log('Latest news order:', res.items.map(a => a.title));
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

  async function loadMore() {
    const next = page + 1;
    try {
      const res = await getArticles({ category, sort: 'latest', page: next, limit: PAGE_SIZE });
      setItems((prev) => [...prev, ...res.items]);
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
