import { createMemoryStore } from './memoryStore.js';

let storePromise;

export function getStore() {
  if (!storePromise) {
    storePromise = process.env.MONGO_URI
      ? import('./mongoStore.js').then((m) => m.createMongoStore(process.env.MONGO_URI))
      : Promise.resolve(createMemoryStore());
  }
  return storePromise;
}
