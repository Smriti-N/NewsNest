import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getArticle, getArticleNeighbors, getRelated, recordView } from '../api.js';
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
  const [navigation, setNavigation] = useState({ previous: null, next: null });
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    setRelated([]);

    async function loadArticle() {
      try {
        const [articleData, neighborData] = await Promise.all([
          getArticle(id),
          getArticleNeighbors(id),
        ]);

        if (requestId !== requestIdRef.current) return;

        setArticle(articleData);
        setNavigation({
          previous: neighborData?.previous ?? null,
          next: neighborData?.next ?? null,
        });

        setIsTransitioning(true);
        window.setTimeout(() => {
          if (requestId === requestIdRef.current) {
            setIsTransitioning(false);
          }
        }, 180);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.message || 'Could not load this story.');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    getRelated(id)
      .then((r) => {
        if (requestId === requestIdRef.current) {
          setRelated(r);
        }
      })
      .catch(() => {});

    if (!counted.has(id)) {
      counted.add(id);
      recordView(id).catch(() => {});
    }

    return () => {
      requestIdRef.current += 1;
    };
  }, [id]);

  const goTo = useCallback(
    (target) => {
      if (!target?.id && !target?._id && !target?.slug) return;
      const targetId = target.id ?? target._id ?? target.slug;
      navigate(`/article/${encodeURIComponent(targetId)}`);
    },
    [navigate]
  );

  useEffect(() => {
    function isTypingTarget(target) {
      if (!target) return false;
      const tagName = target.tagName?.toLowerCase();
      return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable
      );
    }

    function onKeyDown(event) {
      if (isTypingTarget(event.target)) return;

      if (event.key === 'ArrowLeft' && navigation.previous) {
        event.preventDefault();
        goTo(navigation.previous);
      }

      if (event.key === 'ArrowRight' && navigation.next) {
        event.preventDefault();
        goTo(navigation.next);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigation, goTo]);

  if (error) {
    return (
      <section>
        <h1 className="page-title">Story not found</h1>
        <p className="notice notice-error" role="alert">{error}</p>
        <Link to="/" className="btn btn-primary">Back to the feed</Link>
      </section>
    );
  }

  if (loading || !article) return <p className="muted">Loading story...</p>;

  return (
    <div className="article-layout">
      <article
        className={`article-main article-page ${isTransitioning ? 'is-transitioning' : ''}`}
      >
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

        <nav className="article-nav story-navigation" aria-label="Story navigation">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goTo(navigation.previous)}
            disabled={!navigation.previous}
            aria-disabled={!navigation.previous}
          >
            <Icon name="chevron-left" size={16} /> Previous story
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goTo(navigation.next)}
            disabled={!navigation.next}
            aria-disabled={!navigation.next}
          >
            Next story <Icon name="chevron-right" size={16} />
          </button>
        </nav>
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
