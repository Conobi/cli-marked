const compose = require('compose-function');

const {
  section,
  indentify,
  wrapWords,
} = require('../utils');

const {
  HEADER_SYMBOL,
} = require('../constants');

/**
 *
 * @param {string} text
 * @param {number} level
 * @param {(text:string)=>string} style
 * @returns {string}
 */
function renderHeading(text, level, style, indent) {
  const transform = compose(
    section,
    indentify(indent),
    string => style(string),
    wrapWords,
  );

  return transform(`${HEADER_SYMBOL} ${text}`);
}

module.exports = { renderHeading };
