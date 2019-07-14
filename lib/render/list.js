/* eslint-disable jsdoc/require-returns */
const compose = require('compose-function');
const stripAnsi = require('strip-ansi');

const {
  wrapWords,
  semiSection,
  undoColon,
  section,
  toSpaces,
  identity,
} = require('../utils');

const {
  BULLET_POINT,
  BULLETS_REGEX,
  POINT_REGEX,
} = require('../constants');


/**
 *
 * @param {string} line
 * @param {string} indent
 * @returns {string}
 */
function isPointedLine(line, indent) {
  return stripAnsi(line).match(`^(?:${indent})${POINT_REGEX}`);
}

/**
 *
 * @param {*} line
 * @param {*} indent
 */
function isCheckboxedLine(line, indent) {
  return stripAnsi(line).match(`^(?:${indent})${BULLETS_REGEX}`);
}


/**
 *
 */
function bulletPointLine(indent, line) {
  if (isCheckboxedLine(line, indent)) {
    return line;
  }
  return isPointedLine(line, indent)
    ? line
    : `${toSpaces(BULLET_POINT)}${line}`;
}


/**
 *
 * @param {*} lines
 * @param {*} indent
 */
function bulletPointLines(lines, indent) {
  return lines.split('\n')
    .filter(identity)
    .map(line => bulletPointLine(indent, line))
    .join('\n');
}

/**
 *
 * @param {number} n
 */
function numberedPoint(n) {
  return `${n}. `;
}


/**
 *
 * @param {*} indent
 * @param {*} line
 * @param {*} number
 */
function numberedLine(indent, line, number) {
  return isPointedLine(line, indent) ? (
    line.replace(BULLET_POINT, numberedPoint(number + 1))
  ) : (
    `${toSpaces(numberedPoint(number))}${line}`
  );
}

/**
 *
 * @param {*} lines
 * @param {*} indent
 */
function numberedLines(lines, indent) {
  return lines.split('\n')
    .filter(identity)
    .map((line, index) => numberedLine(indent, line, index))
    .join('\n');
}


/**
 *
 * @param {*} indent
 */
function indentList(indent) {
  // eslint-disable-next-line no-shadow
  return function indentList(text) {
    return text.split('\n').join(`\n${indent}`);
  };
}

/**
 *
 * @param {*} body
 * @param {*} ordered
 * @param {*} indent
 */
function list(body, ordered, indent) {
  return ordered
    ? numberedLines(body, indent)
    : bulletPointLines(body, indent);
}
/**
 *
 * @param {string} text
 * @param {string} checkboxes
 * @param {(text:string)=>string} style
 */
function renderListItem(text, checkboxes, style) {
  const transform = compose(
    semiSection,
    undoColon,
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

/**
 *
 * @param {*} body
 * @param {*} ordered
 * @param {string} indent
 */
function renderList(body, ordered, indent) {
  const transform = compose(
    section,
    string => list(string, ordered, indent),
    indentList(indent),
  );

  return transform(body);
}

module.exports = { renderListItem, renderList };
