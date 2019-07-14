const ansiStyles = require('ansi-colors');

const {
  identity,
} = require('./utils');

const defaultOptions = {
  // Base
  paragraph: identity,
  text: identity,
  codespan: ansiStyles.yellow,
  code: ansiStyles.yellow,
  html: ansiStyles.gray,
  listitem: ansiStyles.magenta,

  // Block
  blockquote: ansiStyles.gray.italic,
  blockquoteText: ansiStyles.dim.italic,
  table: ansiStyles.reset,
  headers: [
    ansiStyles.red.underline.bold,
    ansiStyles.yellow.underline.bold,
    ansiStyles.yellow.underline,
    ansiStyles.green.underline,
    ansiStyles.green,
    ansiStyles.green.dim,
  ],

  // Inline
  hr: ansiStyles.dim,
  strong: ansiStyles.bold,
  em: ansiStyles.italic,
  del: ansiStyles.dim.reset.strikethrough,
  link: ansiStyles.blue,
  href: ansiStyles.blue.underline,
  image: ansiStyles.cyan,
  doneMark: ansiStyles.green.bold,
  undoneMark: ansiStyles.red.bold,

  indent: '  ',
  smallIndent: ' ',

};

module.exports = defaultOptions;
