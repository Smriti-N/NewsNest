import { readFileSync } from 'node:fs';

const HOUR = 60 * 60 * 1000;

export function loadSeed() {
  const raw = JSON.parse(
    readFileSync(new URL('./seed.json', import.meta.url), 'utf8')
  );
  return raw.map(({ hoursAgo, ...story }) => ({
    ...story,
    publishedAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
  }));
}
