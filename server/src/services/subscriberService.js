/**
 * @file subscriberService.js
 * @description In-memory subscriber management service for NewsNest Daily Digest.
 */

const subscribers = new Set();

/**
 * Validates whether an email string meets basic email format requirements.
 *
 * @param {unknown} email - The input to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Registers an email address as a subscriber in memory.
 * Checks are case-insensitive.
 *
 * @param {string} email - The email address to subscribe.
 * @returns {{ success: boolean, duplicate: boolean, email?: string }} Result object.
 */
export function addSubscriber(email) {
  const normalized = email.trim().toLowerCase();
  if (subscribers.has(normalized)) {
    return { success: false, duplicate: true };
  }
  subscribers.add(normalized);
  return { success: true, duplicate: false, email: normalized };
}

/**
 * Returns the current total count of unique subscribers.
 *
 * @returns {number} Count of subscribers.
 */
export function getSubscriberCount() {
  return subscribers.size;
}

/**
 * Clears all subscribers from memory (useful for testing).
 */
export function clearSubscribers() {
  subscribers.clear();
}
