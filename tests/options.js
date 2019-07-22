/* eslint-disable prefer-arrow-callback, no-shadow, jsdoc/require-jsdoc */

const assert = require('assert');
const marked = require('marked');
const Renderer = require('..');

function stripTermEsc(string) {
  return string.replace(/\u001B\[\d{1,2}m/g, '');
}

const identity = function (o) {
  return o;
};

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

defaultOptions.emoji = false;

describe('Options', function fn() {
  const r = new Renderer(defaultOptions);

  it('should not translate emojis', function fn() {
    const markdownText = 'Some :emoji:';

    assert.notStrictEqual(marked(markdownText, {
      renderer: r,
    }).indexOf(':emoji:'), -1);
  });

  it('should change tabs by space size', function fn() {
    const options = ({ ...defaultOptions, ...{ tab: 4 } });
    const r = new Renderer(options);

    const blockquoteText = '> Blockquote';
    assert.strictEqual(
      stripTermEsc(marked(blockquoteText, { renderer: r })),
      '\n│ Blockquote\n',
    );

    const listText = '* List Item';
    assert.strictEqual(
      marked(listText, { renderer: r }),
      '\n  • List Item\n',
    );
  });

  it('should use default tabs if passing not supported string', function fn() {
    const options = ({ ...defaultOptions, ...{ tab: 'dsakdskajhdsa' } });
    const r = new Renderer(options);

    const blockquoteText = '> Blockquote';
    assert.strictEqual(
      stripTermEsc(marked(blockquoteText, { renderer: r })),
      '\n│ Blockquote\n',
    );

    const listText = '* List Item';
    assert.strictEqual(
      marked(listText, { renderer: r }),
      '\n  • List Item\n',
    );
  });

  it('should change tabs by allowed characters', function fn() {
    const options = ({ ...defaultOptions, ...{ tab: '\t' } });
    const r = new Renderer(options);

    const blockquoteText = '> Blockquote';
    assert.strictEqual(
      stripTermEsc(marked(blockquoteText, { renderer: r })),
      '\n│ Blockquote\n',
    );

    const listText = '* List Item';
    assert.strictEqual(
      marked(listText, { renderer: r }),
      '\n  • List Item\n',
    );
  });

  it('should support mulitple tab characters', function fn() {
    const options = ({ ...defaultOptions, ...{ tab: '\t\t' } });
    const r = new Renderer(options);

    const blockquoteText = '> Blockquote';
    assert.strictEqual(
      stripTermEsc(marked(blockquoteText, { renderer: r })),
      '\n│ Blockquote\n',
    );

    const listText = '* List Item';
    assert.strictEqual(
      stripTermEsc(marked(listText, { renderer: r })),
      '\n  • List Item\n',
    );
  });
});
