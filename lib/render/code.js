/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
const ansiStyles = require('ansi-colors');
const boxen = require('boxen');
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
function highlight(lang, style) {
  // eslint-disable-next-line no-shadow
  return function highlight(code) {
    if (!ansiStyles.enabled) {
      return code;
    }
    try {
      const sourceCode = lang
        ? cliHighlight(code, { language: lang })
        : style(code);
      const langName = lang
        ? getLangName(lang)
        : null;

      return boxen(sourceCode, {
        title: langName,
        padding: 1,
        borderColor: 'gray',
        dimBorder: true,
        borderStyle: 'round',
        titleColor: 'red',
        dimTitle: true,
      });
    } catch (error) {
      return style(code);
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
function renderCode(code, lang, escaped, style, indent) {
  const transform = compose(
    section,
    indentify(indent),
    highlight(lang, style),
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
