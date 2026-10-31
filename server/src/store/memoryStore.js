/**
 * @file memoryStore.js
 * @description In-memory story store for NewsNest.
 * Provides a zero-configuration, zero-database default storage engine that satisfies
 * the NewsNest storage interface (matching `mongoStore.js`).
 *
 * All story records are stored in memory within an internal array.
 * Data is initialized from `seed.json` on server startup and resets upon server restart.
 */

import { loadSeed } from '../data/loadSeed.js';

/**
 * @typedef {Object} Article
 * @property {string} id - Unique identifier (e.g., 'a1', 'a2').
 * @property {string} title - Article headline (maximum 120 characters).
 * @property {string} summary - Article summary (maximum 50 words).
 * @property {string} category - Category slug (e.g., 'technology', 'india').
 * @property {string} source - Publisher / source attribution name.
 * @property {string} url - Canonical external URL for the full story.
 * @property {number} views - Total view count for the article.
 * @property {boolean} featured - Whether the article is highlighted in the hero carousel.
 * @property {string} publishedAt - Publication date in ISO 8601 string format.
 */

/**
 * @typedef {Object} NewArticleInput
 * @property {string} title - Headline.
 * @property {string} summary - 50-word summary text.
 * @property {string} category - Valid category slug.
 * @property {string} [source] - Optional source attribution.
 * @property {string} [url] - Optional source URL.
 */

/**
 * @typedef {Object} MemoryStore
 * @property {() => Promise<Article[]>} getAll - Retrieve all articles.
 * @property {(id: string) => Promise<Article|null>} getById - Retrieve a single article by ID.
 * @property {(d: NewArticleInput) => Promise<Article>} create - Add a new article to the store.
 * @property {(id: string) => Promise<Article|null>} incrementViews - Increment view count for an article.
 */

/**
 * Creates and initializes an in-memory storage instance.
 *
 * Loads seed data with dynamically computed publication timestamps relative to current time,
 * tracks sequential record counts for ID generation, and returns async storage accessor methods.
 *
 * @returns {MemoryStore} The initialized storage driver.
 */
export function createMemoryStore() {
  /**
   * Internal in-memory collection of article objects.
   * Initialized with initial articles loaded from `seed.json` via `loadSeed()`.
   * @type {Article[]}
   */
  const rows = loadSeed();

  /**
   * Sequence counter used for generating sequential unique IDs (e.g. 'a25', 'a26').
   * Initialized to current seed record count so new IDs never collide with initial rows.
   * @type {number}
   */
  let n = rows.length;

  /**
   * Helper function to find the zero-based array index of an article by its unique ID.
   *
   * @param {string} id - The unique article identifier to look up.
   * @returns {number} The index in `rows`, or -1 if not found.
   */
  const at = (id) => rows.findIndex((r) => r.id === id);

  return {
    /**
     * Retrieves a copy of all articles currently in memory.
     * Uses `rows.slice()` to return a shallow array copy, preventing external callers
     * from inadvertently mutating the internal array length or order directly.
     *
     * @returns {Promise<Article[]>} A promise resolving to an array of all articles.
     */
    getAll: async () => rows.slice(),

    /**
     * Retrieves a single article matching the provided ID.
     *
     * @param {string} id - Unique identifier of the requested article.
     * @returns {Promise<Article|null>} The article record, or null if no match is found.
     */
    getById: async (id) => rows[at(id)] ?? null,

    /**
     * Appends a new article record to the in-memory store.
     *
     * Automatically assigns:
     * - `id`: formatted as 'a' + prefix with pre-incremented counter `++n`.
     * - `views`: initialized to 0.
     * - `featured`: defaults to false for user submissions.
     * - `publishedAt`: stamped with current UTC time in ISO 8601 format.
     *
     * @param {NewArticleInput} d - Validated article input payload.
     * @returns {Promise<Article>} The newly created and stored article object.
     */
    create: async (d) => {
      const r = { id: 'a' + ++n, views: 0, featured: false, ...d, publishedAt: new Date().toISOString() };
      rows.push(r);
      return r;
    },

    /**
     * Atomically increments the view count of an article by 1.
     *
     * Looks up the article in-place:
     * - If found, mutates `r.views++` and returns the updated article object.
     * - If not found, returns null.
     *
     * @param {string} id - Unique identifier of the article whose views are to be incremented.
     * @returns {Promise<Article|null>} The updated article with incremented views, or null.
     */
    incrementViews: async (id) => {
      const r = rows[at(id)];
      return r ? (r.views++, r) : null;
    },
  };
}
