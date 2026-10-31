import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getArticle, getRelated, recordView } from '../api.js';
import Thumb from '../components/Thumb.jsx';
import Icon from '../components/Icon.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import ArticleRow from '../components/ArticleRow.jsx';
import { categoryName } from '../utils/categories.js';
import { formatDate, formatViews, readTime } from '../utils/format.js';

const counted = new Set();

export default function Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    window.scrollTo(0, 0);
    setArticle(null);
    setRelated([]);
    setError('');

    getArticle(id)
      .then((a) => !ignore && setArticle(a))
      .catch((e) => !ignore && setError(e.message));
    getRelated(id)
      .then((r) => !ignore && setRelated(r))
      .catch(() => {});

    if (!counted.has(id)) {
      counted.add(id);
      recordView(id).catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [id]);

  // Arrow key navigation (ignoring form inputs)
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && article?.prev) {
        e.preventDefault();
        navigate(`/article/${article.prev.id}`);
      } else if (e.key === 'ArrowRight' && article?.next) {
        e.preventDefault();
        navigate(`/article/${article.next.id}`);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article, navigate]);

  if (error) {
    return (
      <section>
        <h1 className="page-title">Story not found</h1>
        <p className="notice notice-error">{error}</p>
        <Link to="/" className="btn btn-primary">Back to the feed</Link>
      </section>
    );
  }

  if (!article) return <p className="muted">Loading story...</p>;

  return (
    <div className="article-layout" key={article.id}>
      <article className="article-main article-fade-slide">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/categories/${article.category}`}>{categoryName(article.category)}</Link>
          <span>/</span>
          <span>Article</span>
        </nav>

        <h1 className="article-title">{article.title}</h1>

        <div className="article-meta">
          <span>By {article.source}</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span>
            <Icon name="clock" size={14} /> {readTime(article.summary)}
          </span>
          <span>
            <Icon name="eye" size={14} /> {formatViews(article.views)} views
          </span>
          <BookmarkButton id={article.id} className="article-bookmark" />
        </div>

        <div className="article-hero">
          <Thumb category={article.category} seed={article.id} />
          <span className={`tag tag-${article.category}`}>{categoryName(article.category)}</span>
        </div>

        <p className="article-summary">{article.summary}</p>

        {article.url && (
          <a className="btn btn-primary" href={article.url} target="_blank" rel="noreferrer">
            Read the full story <Icon name="arrow-right" size={16} />
          </a>
        )}

        <div className="article-nav">
          <button
            className="btn btn-outline"
            disabled={!article.prev}
            onClick={() => article.prev && navigate(`/article/${article.prev.id}`)}
            title={article.prev ? article.prev.title : 'No previous story'}
            aria-label={article.prev ? `Previous story: ${article.prev.title}` : 'No previous story'}
          >
            <Icon name="chevron-left" size={16} /> Previous story
          </button>
          <button
            className="btn btn-outline"
            disabled={!article.next}
            onClick={() => article.next && navigate(`/article/${article.next.id}`)}
            title={article.next ? article.next.title : 'No next story'}
            aria-label={article.next ? `Next story: ${article.next.title}` : 'No next story'}
          >
            Next story <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </article>

      <div className="article-side">
        <aside className="panel">
          <h2 className="panel-title">Related news</h2>
          {related.length === 0 && <p className="muted">No related stories yet.</p>}
          {related.map((a) => (
            <ArticleRow key={a.id} article={a} compact />
          ))}
        </aside>
        <aside className="panel">
          <h2 className="panel-title">Share this article</h2>
          <ShareButtons id={article.id} title={article.title} />
        </aside>
      </div>
    </div>
  );
}