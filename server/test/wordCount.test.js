import test from 'node:test';
import assert from 'node:assert/strict';
import { countWords } from '../src/utils/wordCount.js';
import { validateNewArticle } from '../src/services/articleService.js';

const validArticle = {
  title: 'A headline',
  category: 'technology',
};

test('counts runs of non-whitespace characters', () => {
  assert.equal(countWords("don't stop\t\nnow"), 3);
  assert.equal(countWords('  one  two  '), 2);
  assert.equal(countWords(' \t\n'), 0);
});

test('rejects summaries longer than 50 words regardless of whitespace', () => {
  const summary = Array.from({ length: 51 }, (_, index) => `word${index}`).join('\n');
  const { errors } = validateNewArticle({ ...validArticle, summary });

  assert.deepEqual(errors, ['Summary must be 50 words or fewer.']);
});
