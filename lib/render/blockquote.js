const compose = require('compose-function');

const {
  section,
  indentify,
} = require('../utils');

/**
 *
 * @param {string} quote
 * @param {object} style
 * @param {(text:string)=>string} style.blockquote
 * @param {(text:string)=>string} style.blockquoteText
 * @returns {string}
 */
function renderBlockquote(quote, style) {
  const transform = compose(
    section,
    indentify(style.blockquote('│ ')),
    string => style.blockquoteText(string.trim()),
  );

  return transform(quote);
}

module.exports = { renderBlockquote };
