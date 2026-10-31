/**
 * In-memory story store (the default).
 *
 * NewsNest uses this store whenever MONGO_URI is not set (see store/index.js).
 * Stories are loaded from data/seed.json into a plain array when the server
 * starts and live only in this process's memory, so anything published or
 * any view counted is lost when the server restarts.
 *
 * mongoStore.js offers exactly the same four async methods (getAll, getById,
 * create, incrementViews) but keeps stories in MongoDB, so they survive
 * restarts and ids are MongoDB ObjectIds instead of "a1", "a2", ... The rest
 * of the server never knows which store it is talking to.
 */
import { loadSeed } from '../data/loadSeed.js';

/**
 * Builds a new store filled with the seed stories.
 *
 * @returns {object} an object with the async methods getAll, getById,
 *   create and incrementViews. They are async only so they match the
 *   MongoDB store, which really does need to wait.
 */
export function createMemoryStore() {
  // All stories, as plain objects. Every method below reads or changes this array.
  const rows = loadSeed();

  // Counter used to make ids for new stories. Seed ids run "a1" to "a30", so
  // starting from the number of seed stories makes the next id "a31".
  let n = rows.length;

  // Finds the array position of the story with this id. Returns -1 when no
  // story matches, and rows[-1] is undefined, which the methods below turn
  // into null ("not found").
  const at = (id) => rows.findIndex((r) => r.id === id);

  return {
    /**
     * Returns every story. slice() hands back a copy of the array, so callers
     * can sort or filter it without reordering the store itself.
     * @returns {Promise<object[]>}
     */
    getAll: async () => rows.slice(),

    /**
     * Returns the story with this id, or null if there is none.
     * `?? null` turns the undefined from rows[-1] into null.
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    getById: async (id) => rows[at(id)] ?? null,

    /**
     * Adds a new story and returns it.
     * `++n` bumps the counter before it is used, so ids are never reused.
     * Defaults (views 0, not featured) come first so the submitted data `d`
     * can override them, but publishedAt comes last so it is always "now".
     * @param {object} d validated story fields (title, summary, category, source, url)
     * @returns {Promise<object>} the stored story, including its new id
     */
    create: async (d) => {
      const r = { id: 'a' + ++n, views: 0, featured: false, ...d, publishedAt: new Date().toISOString() };
      rows.push(r);
      return r;
    },

    /**
     * Adds one to a story's view count and returns the updated story, or null
     * if the id is unknown.
     * `(r.views++, r)` is a comma expression: it runs r.views++ first, throws
     * that value away, and evaluates to r. It is a short way of writing
     * "increment, then return the story".
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    incrementViews: async (id) => {
      const r = rows[at(id)];
      return r ? (r.views++, r) : null;
    },
  };
}
