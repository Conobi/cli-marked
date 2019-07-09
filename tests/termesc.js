
const assert = require('assert');
const { textLength } = require('../lib/functions');


describe('Terminal escape', () => {
  it('should not be included in text length', () => {
    const tokens = [
      '\u001B[38;5;128mfoo\u001B[0m',
      '\u001B[33mfoo\u001B[22m\u001B[24m\u001B[39m',
      '\u001B[35m\u001B[4m\u001B[1mfoo',
      '\u001B[33mfo\u001B[39mo\u001B[0m',
    ];
    tokens.forEach((token) => {
      assert.equal(textLength(token), 3);
    });
  });
});
