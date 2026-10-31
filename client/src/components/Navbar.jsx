import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';

const THEME_KEY = 'newsnest:theme';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
  } catch {
    // Ignore localStorage access restrictions
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export default function Navbar() {
  const [dark, setDark] = useState(getInitialTheme);
  const [text, setText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      try {
        localStorage.setItem(THEME_KEY, 'dark');
      } catch {}
    } else {
      document.documentElement.removeAttribute('data-theme');
      try {
        localStorage.setItem(THEME_KEY, 'light');
      } catch {}
    }
  }, [dark]);

  function handleSearch(e) {
    e.preventDefault();
    const q = text.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <header className={`navbar${dark ? ' navbar-dark' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand" aria-label="NewsNest home">
          <span className="brand-mark">N</span>
          <span className="brand-name">NewsNest</span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/top">Top News</NavLink>
          <NavLink to="/saved">Saved</NavLink>
        </nav>

        <form className="nav-search" onSubmit={handleSearch} role="search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search news..."
            aria-label="Search news"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={() => setDark((prev) => !prev)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={dark ? 'sun' : 'moon'} size={18} />
          </button>
          <Link to="/write" className="btn btn-primary">
            <Icon name="edit" size={16} />
            Write a story
          </Link>
        </div>
      </div>
    </header>
  );
}
