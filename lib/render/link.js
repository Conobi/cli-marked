/* eslint-disable jsdoc/require-returns */

const supportsHyperlinks = require('supports-hyperlinks');
const ansiEscapes = require('ansi-escapes');
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
 * @param {object} style
 * @param {(text:string)=>string} style.href
 * @param {(text:string)=>string} style.link
 * @returns {string}
 */
function renderLink(href, title, text, style) {
  const transform = compose(
    undoColon,
    unescapeEntities,
    insertEmojis,
  );

  // eslint-disable-next-line no-script-url
  if (href.startsWith('javascript:')) {
    return '';
  }

  const hasText = text && text !== href;
  let out = '';
  if (supportsHyperlinks.stdout) {
    let link = '';
    if (text) {
      link = transform(text);
    } else {
      link = href;
    }
    if (title) { link += ` – ${transform(title)}`; }
    out = style.href(ansiEscapes.link(link, href));
    return out;
  }

  if (hasText) { out += `${style.link(insertEmojis(text))} (`; }
  out += style.href(href);
  if (hasText) { out += ')'; }

  return out;
}

module.exports = {
  renderLink,
};
