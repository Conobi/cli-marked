/* eslint-disable jsdoc/require-returns */
const {
  cleanText,
} = require('./utils');

/**
 *
 * @param {string} href
 * @param {string} title
 * @param {string} text
 * @param {(text:string)=>string} style
 */
function renderImage(href, title, text, style) {
  let out = `![${cleanText(text)}`;
  if (title) { out += ` – ${cleanText(title)}`; }
  return style(`${out}]`);
}


module.exports = {
  renderImage,
};
