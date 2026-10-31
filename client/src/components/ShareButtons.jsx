import Icon from './Icon.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ShareButtons({ id, title }) {
  const toast = useToast();
  const url = `${window.location.origin}/article/${id}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copyLink() {
    // Bonus: Use native share sheet on mobile devices when available
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) throw new Error('Copy command failed');
      }
      toast.show ? toast.show('Link copied') : toast('Link copied');
    } catch (err) {
      const errorMsg = 'Failed to copy link';
      toast.error ? toast.error(errorMsg) : (toast.show ? toast.show(errorMsg) : toast(errorMsg));
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