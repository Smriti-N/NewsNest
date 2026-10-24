import Icon from './Icon.jsx';
import { useBookmarkContext } from '../context/BookmarksContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function BookmarkButton({ id, className = '' }) {
  const bookmarks = useBookmarkContext();
  const toast = useToast();
  const saved = bookmarks.isBookmarked(id);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    bookmarks.toggle(id);
    toast(saved ? 'Removed from saved' : 'Saved for later', saved ? 'info' : 'success');
  }

  return (
    <button
      type="button"
      className={`bookmark${saved ? ' bookmark-on' : ''} ${className}`}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save story'}
    >
      <Icon name="bookmark" size={18} />
    </button>
  );
}
