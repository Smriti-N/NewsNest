import { ICONS } from './Icon.jsx';
import { CATEGORY_ICONS } from '../utils/categories.js';

const PALETTES = {
  technology: ['#2347ff', '#8b5cf6'],
  business: ['#0f9d6b', '#34d399'],
  sports: ['#f97316', '#fbbf24'],
  politics: ['#be185d', '#fb7185'],
  health: ['#0d9488', '#5eead4'],
  science: ['#1d4ed8', '#22d3ee'],
  entertainment: ['#9333ea', '#f472b6'],
  world: ['#1e40af', '#38bdf8'],
  india: ['#ea580c', '#16a34a'],
};

function hash(text) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export default function Thumb({ category, seed, className = '' }) {
  const [from, to] = PALETTES[category] || ['#475569', '#94a3b8'];
  const h = hash(String(seed));
  const gradientId = `tg-${category}-${h}`;
  const icon = ICONS[CATEGORY_ICONS[category]] || ICONS.globe;
  const a = { x: 40 + (h % 260), y: 30 + ((h >> 3) % 120), r: 70 + ((h >> 5) % 60) };
  const b = { x: 200 + ((h >> 7) % 180), y: 100 + ((h >> 9) % 120), r: 50 + ((h >> 11) % 70) };

  return (
    <svg
      className={`thumb ${className}`}
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${gradientId})`} />
      <circle cx={a.x} cy={a.y} r={a.r} fill="#fff" opacity=".13" />
      <circle cx={b.x} cy={b.y} r={b.r} fill="#000" opacity=".10" />
      <path d="M0 190 Q100 150 200 185 T400 170 V240 H0Z" fill="#fff" opacity=".12" />
      <g
        transform="translate(161.6 81.6) scale(3.2)"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".88"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    </svg>
  );
}
