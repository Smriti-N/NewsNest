import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured } from '../api.js';
import { categoryName } from '../utils/categories.js';
import Thumb from './Thumb.jsx';
import Icon from './Icon.jsx';

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    getFeatured().then(setSlides).catch(() => setSlides([]));
  }, []);

  const next = () => setIndex((i) => (i + 1) % (slides.length));
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, paused]);

  if (slides.length === 0) return <div className="hero hero-empty" aria-hidden="true" />;

  const slide = slides[index];

  return (
    <section
      className="hero"
      aria-label="Featured stories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slide" key={slide.id}>
        <Thumb category={slide.category} seed={slide.id} className="hero-bg" />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className={`tag tag-${slide.category}`}>{categoryName(slide.category)}</span>
          <h1 className="hero-title">
            <Link to={`/article/${slide.id}`}>{slide.title}</Link>
          </h1>
          <p className="hero-summary">{slide.summary}</p>
          <Link to={`/article/${slide.id}`} className="btn btn-light">
            Read more <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Previous story">
            <Icon name="chevron-left" size={20} />
          </button>
          <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Next story">
            <Icon name="chevron-right" size={20} />
          </button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`hero-dot${i === index ? ' hero-dot-on' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show story ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
