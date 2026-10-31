import { loadSeed } from '../data/loadSeed.js';

/**
 * Creates an in-memory data store for managing news articles.
 * Loads seed data upon initialization.
 */
export function createMemoryStore() {
  const articles = loadSeed();
  let articleCount = articles.length;

  /**
   * Helper function to locate an article's array index by its unique ID.
   * @param {string} id - The article ID.
   * @returns {number} Array index, or -1 if not found.
   */
  const findArticleIndexById = (id) => articles.findIndex((article) => article.id === id);

  return {
    /**
     * Retrieves a copy of all articles.
     * @returns {Promise<Array>} Array of articles.
     */
    getAll: async () => articles.slice(),

    /**
     * Retrieves an article by its ID.
     * @param {string} id - The article ID.
     * @returns {Promise<Object|null>} Article object or null if not found.
     */
    getById: async (id) => {
      const index = findArticleIndexById(id);
      return index !== -1 ? articles[index] : null;
    },

    /**
     * Creates and stores a new article with generated default fields.
     * @param {Object} articleData - The new article payload.
     * @returns {Promise<Object>} The created article object.
     */
    create: async (articleData) => {
      articleCount += 1;
      const newArticle = {
        id: 'a' + articleCount,
        views: 0,
        featured: false,
        ...articleData,
        publishedAt: new Date().toISOString(),
      };
      articles.push(newArticle);
      return newArticle;
    },

    /**
     * Increments the view count for a target article by 1.
     * @param {string} id - The article ID.
     * @returns {Promise<Object|null>} The updated article object or null if not found.
     */
    incrementViews: async (id) => {
      const index = findArticleIndexById(id);
      if (index === -1) return null;

      const article = articles[index];
      article.views += 1;
      return article;
    },
  };
}