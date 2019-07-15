/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
const ansiStyles = require('ansi-colors');
const fieldset = require('fieldset');
const languages = require('languages-aliases');
const { highlight: cliHighlight } = require('cli-highlight');
const compose = require('compose-function');

const {
  section,
  indentify,
  unescapeEntities,
} = require('../utils');

/**
 *
 * @param {*} lang
 */
function getLangName(lang) {
  if (!lang) {
    return lang;
  }
  return languages[lang] ? languages[lang] : lang;
}

/**
 *
 * @param {string} lang
 * @returns {(code:string)=>string}
 */
function highlight(lang) {
  // eslint-disable-next-line no-shadow
  return function highlight(code) {
    if (!ansiStyles.enabled) return code;
    try {
      return fieldset(cliHighlight(code, { language: lang || 'plaintext' }), {
        ...(lang ? { title: getLangName(lang) } : {}),
        padding: 1,
        borderColor: 'gray',
        dimBorder: true,
        borderStyle: 'round',
        titleColor: 'red',
        dimTitle: true,
      });
    } catch (error) {
      return (code);
    }
  };
}

/**
 *
 * @param {string} code
 * @param {string} lang
 * @param {boolean} escaped
 * @param {string} indent
 */
function renderCode(code, lang, escaped, indent) {
  const transform = compose(
    section,
    indentify(indent),
    highlight(lang),
  );

  return transform(code);
}

/**
 *
 * @param {string} code
 * @param {Function} style
 */
function renderCodespan(code, style) {
  const transform = compose(
    string => style(string),
    unescapeEntities,
  );

  return transform(code);
}

module.exports = {
  renderCode,
  renderCodespan,
};
