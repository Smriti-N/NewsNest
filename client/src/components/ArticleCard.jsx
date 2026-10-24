import { Link } from 'react-router-dom';
import Thumb from './Thumb.jsx';
import Icon from './Icon.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import { timeAgo } from '../utils/timeAgo.js';
import { formatViews } from '../utils/format.js';
import { categoryName } from '../utils/categories.js';

export default function ArticleCard({ article }) {
  return (
    <article className="card">
      <Link to={`/article/${article.id}`} className="card-media">
        <Thumb category={article.category} seed={article.id} />
        <span className={`tag tag-${article.category}`}>{categoryName(article.category)}</span>
      </Link>
      <BookmarkButton id={article.id} className="card-bookmark" />
      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="card-summary">{article.summary}</p>
        <div className="card-meta">
          <span>
            <Icon name="clock" size={13} /> {timeAgo(article.publishedAt)}
          </span>
          <span>
            <Icon name="eye" size={13} /> {formatViews(article.views)}
          </span>
        </div>
      </div>
    </article>
  );
}
