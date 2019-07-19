/* eslint-disable no-shadow */
/* eslint-disable jsdoc/require-example,jsdoc/require-returns */
const wrapAnsi = require('wrap-ansi');
const normalizeWhitespace = require('normalize-html-whitespace');
const emoji = require('node-emoji');

const {
  COLON_REPLACER_REGEXP,
} = require('./constants');


function insertEmojis(text) {
  return text.replace(/:([A-Za-z0-9_\-\+]+?):/g, (emojiString) => {
    const emojiSign = emoji.get(emojiString);
    if (!emojiSign) return emojiString;
    return `${emojiSign} `;
  });
}
/**
 *
 * @param {string} string
 * @returns {string}
 */
function identity(string) {
  return string;
}

/**
 *
 * @param {*} string
 */
function removeNewLines(string) {
  return normalizeWhitespace(string.split('\n').join('  '));
}

/**
 *
 * @param {*} string
 */
function wrapWords(string) {
  return wrapAnsi(string, 80, {
    trim: false,
  });
}

/**
 *
 * @param {*} indent
 */
function indentify(indent) {
  return function indentify(text) {
    if (!text) return text;
    return indent + text.split('\n').join(`\n${indent}`);
  };
}

/**
 *
 * @param {*} string
 */
function toSpaces(string) {
  return (' ').repeat(string.length);
}

/**
 *
 * @param {*} text
 */
function section(text) {
  return `\n${text}\n`;
}

/**
 *
 * @param {*} text
 */
function semiSection(text) {
  return `\n${text}`;
}

/**
 *
 * @param {*} inputHrString
 * @param {*} length
 */
function hr(inputHrString, length) {
  const lengthHr = length || process.stdout.columns;
  return (new Array(lengthHr)).join(inputHrString);
}

/**
 *
 * @param {*} string
 */
function undoColon(string) {
  return string.replace(COLON_REPLACER_REGEXP, ':');
}

/**
 *
 * @param {string} html
 */
function unescapeEntities(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

module.exports = {
  identity,
  unescapeEntities,
  undoColon,
  section,
  indentify,
  hr,
  wrapWords,
  removeNewLines,
  semiSection,
  toSpaces,
  insertEmojis,
};
