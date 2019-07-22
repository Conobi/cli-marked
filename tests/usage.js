/* eslint-disable prefer-arrow-callback, no-shadow, jsdoc/require-jsdoc */

const assert = require('assert');
const marked = require('marked');
const Renderer = require('..');


const identity = function fn(o) {
  return o;
};

function stripTermEsc(string) {
  return string.replace(/\u001B\[\d{1,2}m/g, '');
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

const defaultOptions2 = {};
options.forEach((opt) => {
  defaultOptions[opt] = identity;
});
defaultOptions2.showSectionPrefix = false;


defaultOptions.tableOptions = {
  chars: { top: '@@@@TABLE@@@@@' },
};

/**
 *
 * @param {*} string
 * @param {*} gfm
 */
function markup(string, gfm = false) {
  // eslint-disable-next-line no-var
  var r = new Renderer(defaultOptions2);
  // eslint-disable-next-line no-var
  var markedOptions = {
    renderer: r,
    gfm,
    breaks: true,
  };
  return stripTermEsc(marked(string, markedOptions));
}


describe('Renderer', function fn() {
  const r = new Renderer(defaultOptions);
  const markedOptions = {
    renderer: r,
  };

  it('should render links', function fn() {
    const text = '[Google](http://google.com)';
    const expected = 'Google (http://google.com)';
    assert.strictEqual(marked(text, markedOptions).trim(), expected);
  });

  it('should not show link href twice if link and url is equal', function fn() {
    const text = 'http://google.com';
    assert.strictEqual(marked(text, markedOptions).trim(), text);
  });

  it('should render html as html', function fn() {
    const html = '<strong>foo</strong>';
    assert.strictEqual(marked(html, markedOptions).trim(), html);
  });

  it('should not escape entities', function fn() {
    const text = '# This < is "foo". it\'s a & string\n'
      + '> This < is "foo". it\'s a & string\n\n'
      + 'This < is **"foo"**. it\'s a & string\n\n'
      + 'This < is "foo". it\'s a & string';

    const expected = '§ This < is "foo". it\'s a & string\n\n'
      + '│ This < is "foo". it\'s a & string\n\n'
      + 'This < is "foo". it\'s a & string\n\n'
      + 'This < is "foo". it\'s a & string';
    assert.strictEqual(stripTermEsc(marked(text, markedOptions).trim()), expected);
  });

  it('should not translate emojis inside codespans', function fn() {
    const markdownText = 'Some `:+1:`';

    assert.notStrictEqual(marked(markdownText, markedOptions).indexOf(':+1:'), -1);
  });

  it('should translate emojis', function fn() {
    const markdownText = 'Some :+1:';
    assert.strictEqual(marked(markdownText, markedOptions).indexOf(':+1'), -1);
  });

  it('should show default if not supported emojis', function fn() {
    const markdownText = 'Some :someundefined:';
    assert.notStrictEqual(marked(markdownText, markedOptions).indexOf(':someundefined:'), -1);
  });

  it('should nuke section header', function fn() {
    const text = '# Contents\n';
    const expected = '\n § Contents\n';
    assert.strictEqual(markup(text), expected);
  });


  it('should render ordered and unordered list with same newlines', function fn() {
    const ul = '* ul item\n'
    + '* ul item';
    const ol = '1. ol item\n'
    + '2. ol item';
    const before = '\n';
    const after = '\n';

    assert.strictEqual(markup(ul),
      `${before
      }  • ul item\n`
      + `  • ul item${
        after}`);

    assert.strictEqual(markup(ol),
      `${before
      }  1. ol item\n`
      + `  2. ol item${
        after}`);
  });

  it('should render nested lists', function fn() {
    const ul = '* ul item\n'
    + '  * ul item';
    const ol = '1. ol item\n'
    + '  1. ol item';
    const olul = '1. ol item\n'
    + '  * ul item';
    const ulol = '* ul item\n'
    + '  1. ol item';
    const before = '\n';
    const after = '\n';

    assert.strictEqual(markup(ul),
      `${before
      }  • ul item\n`
      + `      • ul item${
        after}`);

    assert.strictEqual(markup(ol),
      `${before
      }  1. ol item\n`
      + `      1. ol item${
        after}`);

    assert.strictEqual(markup(olul),
      `${before
      }  1. ol item\n`
      + `      • ul item${
        after}`);

    assert.strictEqual(markup(ulol),
      `${before
      }  • ul item\n`
      + `      1. ol item${
        after}`);
  });

  it('should render task items', function fn() {
    const tasks = '* [ ] task item\n'
    + '* [X] task item';
    const before = '\n';
    const after = '\n';

    assert.strictEqual(markup(tasks),
      `${before
      }  ✖ task item \n`
      + `  ✔ task item ${
        after}`);
  });
});
