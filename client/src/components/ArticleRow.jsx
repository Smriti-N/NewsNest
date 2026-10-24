import { Link } from 'react-router-dom';
import Thumb from './Thumb.jsx';
import Icon from './Icon.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import { timeAgo } from '../utils/timeAgo.js';
import { formatViews } from '../utils/format.js';
import { categoryName } from '../utils/categories.js';

export default function ArticleRow({ article, rank, compact = false }) {
  return (
    <article className={`row${compact ? ' row-compact' : ''}`}>
      {rank && <span className="row-rank">{rank}</span>}
      <Link to={`/article/${article.id}`} className="row-thumb">
        <Thumb category={article.category} seed={article.id} />
      </Link>
      <div className="row-body">
        <h3 className="row-title">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        {!compact && <p className="row-summary">{article.summary}</p>}
        <div className="row-meta">
          <span className={`tag tag-${article.category}`}>{categoryName(article.category)}</span>
          <span>
            <Icon name="clock" size={13} /> {timeAgo(article.publishedAt)}
          </span>
          <span>
            <Icon name="eye" size={13} /> {formatViews(article.views)}
          </span>
        </div>
      </div>
      {!compact && <BookmarkButton id={article.id} />}
    </article>
  );
}
