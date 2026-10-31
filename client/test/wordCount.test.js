import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { countWords } from '../src/utils/wordCount.js';

const sharedCases = JSON.parse(
  readFileSync(new URL('../../shared/wordCountCases.json', import.meta.url), 'utf8')
);

for (const { name, text, count } of sharedCases) {
  test(`client word count: ${name}`, () => {
    assert.equal(countWords(text), count);
  });
}
