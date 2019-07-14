/* eslint-disable jsdoc/require-returns */
const compose = require('compose-function');

const {
  wrapWords,
  semiSection,
  cleanText,
} = require('./utils');

const {
  BULLET_POINT,
} = require('./constants');

/**
 *
 * @param {string} text
 * @param {string} checkboxes
 * @param {(text:string)=>string} style
 */
function renderListItem(text, checkboxes, style) {
  const transform = compose(
    semiSection,
    cleanText,
    wrapWords,
  );

  const bullet = style(BULLET_POINT);

  const isNested = text.includes('\n');
  if (isNested) { text = text.trim(); }

  if (checkboxes) {
    return transform(text);
  }

  return transform(bullet + text);
}


module.exports = { renderListItem };
