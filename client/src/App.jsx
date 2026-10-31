import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Categories from './pages/Categories.jsx';
import TopNews from './pages/TopNews.jsx';
import Article from './pages/Article.jsx';
import Search from './pages/Search.jsx';
import Saved from './pages/Saved.jsx';
import Write from './pages/Write.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<Categories />} />
          <Route path="/top" element={<TopNews />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/write" element={<Write />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
