/* eslint-disable prefer-arrow-callback, no-shadow, jsdoc/require-jsdoc */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const Renderer = require('..');


const identity = function fn(o) {
  return o;
};

function stripTermEsc(string) {
  return string.replace(/\u001B\[\d{1,2}m/g, '');
}

function getFixtureFile(fileName) {
  return fs.readFileSync(
    path.resolve(__dirname, 'fixtures/', fileName),
    { encoding: 'utf8' },
  );
}

const options = [
  'code', 'blockquote', 'html', 'heading',
  'firstHeading', 'hr', 'listitem', 'table',
  'paragraph', 'strong', 'em', 'codespan',
  'del', 'link', 'href',
];

const defaultOptions = {};
options.forEach((opt) => {
  defaultOptions[opt] = identity;
});

function markup(string) {
  const r = new Renderer(defaultOptions);
  return stripTermEsc(marked(string, { renderer: r }));
}

describe('e2', function fn() {
  it('should render a document full of different supported syntax', function fn() {
    const actual = markup(getFixtureFile('e2e.md'));
    const expected = getFixtureFile('e2e.result.txt');
    assert.strictEqual(actual, expected);
  });
});
