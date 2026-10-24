import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticle } from '../api.js';
import { useBookmarkContext } from '../context/BookmarksContext.jsx';
import ArticleRow from '../components/ArticleRow.jsx';
import Icon from '../components/Icon.jsx';

export default function Saved() {
  const bookmarks = useBookmarkContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = bookmarks.ids.join(',');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(bookmarks.ids.map((id) => getArticle(id).catch(() => null))).then((list) => {
      if (cancelled) return;
      setItems(list.filter(Boolean));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <section>
      <div className="section-head">
        <div>
          <h1 className="page-title">Saved articles</h1>
          <p className="lead">Your bookmarked news, kept on this device</p>
        </div>
        {bookmarks.ids.length > 0 && (
          <button className="btn btn-outline" onClick={bookmarks.clear}>
            <Icon name="trash" size={16} /> Clear all
          </button>
        )}
      </div>

      {loading && bookmarks.ids.length > 0 && <p className="muted">Loading saved stories...</p>}

      {!loading && items.length === 0 && (
        <div className="empty">
          <Icon name="bookmark" size={36} />
          <h2>Nothing saved yet</h2>
          <p>Tap the bookmark on any story and it will show up here.</p>
          <Link to="/" className="btn btn-primary">Browse the latest news</Link>
        </div>
      )}

      <div className="stack">
        {items.map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
