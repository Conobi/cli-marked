/* eslint-disable jsdoc/require-returns */

const compose = require('compose-function');
const terminalLink = require('terminal-link');

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

  let link = '';
  if (text) {
    link = transform(text);
  } else {
    link = href;
  }
  if (title) { link += ` – ${transform(title)}`; }

  link = style.href(link);

  return terminalLink(link, href, {
    fallback: (text, url) => (text !== url ? `${text} (${url})` : url),
  });
}

module.exports = {
  renderLink,
};
