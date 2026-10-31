import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateNewArticle } from '../src/services/articleService.js';
import { countWords } from '../src/utils/wordCount.js';

const sharedCases = JSON.parse(
  readFileSync(new URL('../../shared/wordCountCases.json', import.meta.url), 'utf8')
);

for (const { name, text, count } of sharedCases) {
  test(`server word count: ${name}`, () => {
    assert.equal(countWords(text), count);
  });
}

test('server accepts a 50-word summary separated by line breaks', () => {
  const summary = Array.from({ length: 50 }, (_, index) => `word${index}`).join('\n');
  const { errors } = validateNewArticle({ title: 'Headline', summary, category: 'technology' });

  assert.ok(!errors.includes('Summary must be 50 words or fewer.'));
});

test('server rejects a 51-word summary separated by whitespace', () => {
  const summary = Array.from({ length: 51 }, (_, index) => `word${index}`).join('\n');
  const { errors } = validateNewArticle({ title: 'Headline', summary, category: 'technology' });

  assert.ok(errors.includes('Summary must be 50 words or fewer.'));
});
