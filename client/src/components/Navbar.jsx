import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';

const THEME_KEY = 'newsnest:theme';

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark';
  } catch {
    return false;
  }
}

export default function Navbar() {
  const [dark, setDark] = useState(readTheme);
  const [text, setText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // storage unavailable: the theme just won't be remembered
    }
  }, [dark]);

  function handleSearch(e) {
    e.preventDefault();
    const q = text.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <header className="navbar">
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
