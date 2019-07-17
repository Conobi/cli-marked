/* eslint-disable jsdoc/require-returns */
const compose = require('compose-function');

const {
  undoColon,
  unescapeEntities,
  insertEmojis,
} = require('../utils');

/**
 *
 * @param {string} href
 * @param {string} title
 * @param {string} text
 * @param {(text:string)=>string} style
 */
function renderImage(href, title, text, style) {
  const transform = compose(
    undoColon,
    unescapeEntities,
    insertEmojis,
  );

  let out = `![${transform(text)}`;
  if (title) { out += ` – ${transform(title)}`; }
  return style(`${out}]`);
}

module.exports = {
  renderImage,
};
