import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countWords as serverCount } from '../src/utils/wordCount.js';
import { countWords as clientCount } from '../../client/src/utils/wordCount.js';

// Shared cases: the client counter and the server must give the same answer.
const cases = [
  ['', 0],
  ['   ', 0],
  ['\n\t \n', 0],
  ['one', 1],
  ["don't stop", 2],
  ['  leading and trailing  ', 3],
  ['double  spaces  here', 3],
  ['tabs\tbetween\twords', 3],
  ['line\nbreaks\r\nhere', 3],
  ['well-known e-mail, ok?', 3],
  [Array(60).fill('word').join('\n'), 60],
];

for (const [text, expected] of cases) {
  test(`counts ${JSON.stringify(text.slice(0, 30))} as ${expected}`, () => {
    assert.equal(serverCount(text), expected);
    assert.equal(clientCount(text), expected);
  });
}
