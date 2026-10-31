import Icon from './Icon.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ShareButtons({ id, title }) {
  const toast = useToast();
  const url = `${window.location.origin}/article/${id}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied', 'success');
    } catch {
      toast('Failed to copy link', 'error');
    }
  }

  return (
    <div className="share">
      <button className="share-btn" onClick={copyLink} aria-label="Copy link" title="Copy link">
        <Icon name="link" size={18} />
      </button>
      <a className="share-btn share-x" href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noreferrer" aria-label="Share on X">X</a>
      <a className="share-btn share-fb" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook">f</a>
      <a className="share-btn share-in" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">in</a>
      <a className="share-btn share-wa" href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">wa</a>
    </div>
  );
}