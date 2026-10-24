import { loadSeed } from '../data/loadSeed.js';

export function createMemoryStore() {
  const rows = loadSeed();
  let n = rows.length;
  const at = (id) => rows.findIndex((r) => r.id === id);

  return {
    getAll: async () => rows.slice(),
    getById: async (id) => rows[at(id)] ?? null,
    create: async (d) => {
      const r = { id: 'a' + ++n, views: 0, featured: false, ...d, publishedAt: new Date().toISOString() };
      rows.push(r);
      return r;
    },
    incrementViews: async (id) => {
      const r = rows[at(id)];
      return r ? (r.views++, r) : null;
    },
  };
}
