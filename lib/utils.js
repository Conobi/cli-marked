/* eslint-disable no-shadow */
/* eslint-disable jsdoc/require-example,jsdoc/require-returns */
const emoji = require('node-emoji');
const stripAnsi = require('strip-ansi');
const wrapAnsi = require('wrap-ansi');
const normalizeWhitespace = require('normalize-html-whitespace');
const compose = require('compose-function');


const {
  COLON_REPLACER_REGEXP,
  TAB_ALLOWED_CHARACTERS,
  POINT_REGEX,
  BULLET_POINT,
  BULLETS_REGEX,
} = require('./constants');


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
  return normalizeWhitespace(string.replace('\n', '  '));
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
function indentList(indent) {
  return function indentList(text) {
    return text.split('\n').join(`\n${indent}`);
  };
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
 * @param {*} line
 * @param {*} indent
 */
const isPointedLine = function (line, indent) {
  return stripAnsi(line).match(`^(?:${indent})${POINT_REGEX}`);
};

/**
 *
 * @param {*} line
 * @param {*} indent
 */
const isCheckboxedLine = function (line, indent) {
  return stripAnsi(line).match(`^(?:${indent})${BULLETS_REGEX}`);
};


/**
 *
 * @param {*} string
 */
function toSpaces(string) {
  return (' ').repeat(string.length);
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
 * @param {*} n
 */
const numberedPoint = function (n) {
  return `${n}. `;
};

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
 * @param {*} text
 */
function insertEmojis(text) {
  return text.replace(/:([A-Za-z0-9_\-\+]+?):/g, (emojiString) => {
    const emojiSign = emoji.get(emojiString);
    if (!emojiSign) return emojiString;
    return `${emojiSign} `;
  });
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


/**
 *
 * @param {*} string
 */
function isAllowedTabString(string) {
  return TAB_ALLOWED_CHARACTERS.some(char => string.match(`^(${char})+$`));
}

/**
 *
 * @param {*} tab
 * @param {*} fallbackTab
 */
function sanitizeTab(tab, fallbackTab) {
  if (isAllowedTabString(tab)) {
    return tab;
  }
  return fallbackTab;
}

const cleanText = compose(undoColon, unescapeEntities, insertEmojis);


/**
 *
 * @param {string} text
 * @param {number} level
 * @param {(text:string)=>string} style
 */
function header(text, level, style) {
  return ` ${text}`;
}

module.exports = {
  list,
  identity,
  insertEmojis,
  unescapeEntities,
  undoColon,
  section,
  indentify,
  sanitizeTab,
  indentList,
  hr,
  header,
  wrapWords,
  removeNewLines,
  semiSection,
  cleanText,
};
