import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';

const THEME_KEY = 'newsnest:theme';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    const isDark = saved ? saved === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    return isDark;
  } catch {
    return false;
  }
}

export default function Navbar() {
  const [dark, setDark] = useState(getInitialTheme);
  const [text, setText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors
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
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
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
