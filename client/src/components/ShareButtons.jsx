import Icon from './Icon.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ShareButtons({ id, title }) {
  const toast = useToast();
  const url = `${window.location.origin}/article/${id}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('textarea');
        input.value = url;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        let copied;
        try {
          input.select();
          copied = document.execCommand('copy');
        } finally {
          input.remove();
        }
        if (!copied) throw new Error('Clipboard copy failed');
      }
      toast('Link copied', 'success');
    } catch {
      toast('Could not copy the link. Please try again.', 'error');
    }
  }

  async function shareArticle() {
    try {
      await navigator.share({ title, text: title, url });
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast('Could not share this article. Please try again.', 'error');
      }
    }
  }

  return (
    <div className="share">
      <button type="button" className="share-btn" onClick={copyLink} aria-label="Copy link" title="Copy link">
        <Icon name="link" size={18} />
      </button>
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button type="button" className="share-btn" onClick={shareArticle} aria-label="Share article" title="Share article">
          ↗
        </button>
      )}
      <a className="share-btn share-x" href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noreferrer" aria-label="Share on X">X</a>
      <a className="share-btn share-fb" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook">f</a>
      <a className="share-btn share-in" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">in</a>
      <a className="share-btn share-wa" href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">wa</a>
    </div>
  );
}
