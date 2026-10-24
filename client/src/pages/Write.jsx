import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArticle } from '../api.js';
import useCategories from '../hooks/useCategories.js';
import ArticleCard from '../components/ArticleCard.jsx';
import { useToast } from '../context/ToastContext.jsx';

const MAX_WORDS = 50;

export default function Write() {
  const categories = useCategories();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '',
    summary: '',
    category: 'technology',
    source: '',
    url: '',
  });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const count = form.summary.match(/\w+/g)?.length ?? 0;
  const tooLong = count > MAX_WORDS;
  const percent = Math.min(100, (count / MAX_WORDS) * 100);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const created = await createArticle(form);
      toast('Your story is live', 'success');
      navigate(`/article/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const preview = {
    id: 'preview',
    category: form.category,
    title: form.title || 'Your headline appears here',
    summary: form.summary || 'Your 50-word summary appears here as you type.',
    publishedAt: new Date().toISOString(),
    views: 0,
  };

  return (
    <section>
      <h1 className="page-title">Write a story</h1>
      <p className="lead">Tell readers what happened in {MAX_WORDS} words or fewer.</p>

      <div className="write-layout">
        <form className="form panel" onSubmit={handleSubmit}>
          {error && <p className="notice notice-error">{error}</p>}

          <label>
            Headline
            <input value={form.title} onChange={update('title')} maxLength={120} required />
          </label>

          <label>
            Summary
            <textarea rows={6} value={form.summary} onChange={update('summary')} required />
            <span className="meter" aria-hidden="true">
              <span className={tooLong ? 'meter-over' : ''} style={{ width: `${percent}%` }} />
            </span>
            <span className={`counter${tooLong ? ' counter-over' : ''}`}>
              {count} / {MAX_WORDS} words
            </span>
          </label>

          <div className="form-row">
            <label>
              Category
              <select value={form.category} onChange={update('category')}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Source (optional)
              <input value={form.source} onChange={update('source')} placeholder="Reader submission" />
            </label>
          </div>

          <label>
            Link to the full story (optional)
            <input type="url" value={form.url} onChange={update('url')} placeholder="https://" />
          </label>

          <button className="btn btn-primary" type="submit" disabled={sending || tooLong}>
            {sending ? 'Publishing...' : 'Publish story'}
          </button>
        </form>

        <div className="write-side">
          <h2 className="panel-title">Live preview</h2>
          <ArticleCard article={preview} />
          <div className="panel tips">
            <h2 className="panel-title">Writing tips</h2>
            <ul>
              <li>Lead with what happened, not the background.</li>
              <li>One idea per story. Cut anything a reader can skip.</li>
              <li>Add a link so readers can go deeper.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
