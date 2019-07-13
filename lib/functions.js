/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-example */
const emoji = require('node-emoji');
const { highlight: cliHighlight } = require('cli-highlight');
const stripAnsi = require('strip-ansi');
const ansiStyles = require('ansi-colors');
const boxen = require('boxen');
const languages = require('languages-aliases');
const wrap = require('word-wrap');

const {
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP_REGEXP,
  COLON_REPLACER_REGEXP,
  TAB_ALLOWED_CHARACTERS,
  POINT_REGEX,
  BULLET_POINT,
  BULLETS_REGEX,
} = require('./constants');


function getLangName(lang) {
  return languages[lang] ? languages[lang] : lang;
}

/**
 *
 * @param {*} string
 */
function identity(string) {
  // return string
  return wrap(string.replace('\n', ' '), { width: 80, indent: '' });
}


/**
 *
 * @param {*} indent
 * @param {*} text
 */
function indentLines(indent, text) {
  return text.split('\n').join(`\n${indent}`);
}

/**
 *
 * @param {*} indent
 * @param {*} text
 */
function indentify(indent, text) {
  if (!text) return text;
  return indent + text.split('\n').join(`\n${indent}`);
}

/**
 * Prevents nested lists from joining their parent list's last line.
 *
 * @param {*} body
 * @param {*} indent
 */
function fixNestedLists(body, indent) {
  const regex = new RegExp(`${''
    + '(\\S(?: |  )?)' // Last char of current point, plus one or two spaces
    // to allow trailing spaces
    + '((?:'}${indent})+)` // Indentation of sub point
    + `(${POINT_REGEX}(?:.*)+)$`, 'gm'); // Body of subpoint
  return body.replace(regex, `$1\n${indent}$2$3`);
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
 * @param {*} code
 * @param {*} lang
 * @param {*} options
 */
function highlight(code, lang, options) {
  if (!ansiStyles.enabled) return code;

  const style = options.code;

  try {
    return boxen(cliHighlight(code, { language: lang }), {
      ...(lang ? { title: getLangName(lang) } : {}),
      padding: 1,
      borderColor: 'gray',
      borderStyle: 'round',
      titleColor: 'red',
      titleDim: true,

    });
  } catch (error) {
    return style(code);
  }
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
 * @param {*} text
 * @param {*} escape
 */
function generateTableRow(text, escape = identity) {
  if (!text) return [];
  const lines = escape(text).split('\n');

  const data = [];
  lines.forEach((line) => {
    if (!line) return;
    const parsed = line.replace(TABLE_ROW_WRAP_REGEXP, '').split(TABLE_CELL_SPLIT);

    data.push(parsed.splice(0, parsed.length - 1));
  });
  return data;
}

/**
 *
 * @param {*} html
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
 * @param  {...any} funcs
 */
function compose(...funcs) {
  return function f(...arguments_) {
    // eslint-disable-next-line no-plusplus
    for (let i = funcs.length; i-- > 0;) {
      // eslint-disable-next-line no-param-reassign
      arguments_ = [funcs[i].apply(this, arguments_)];
    }
    return arguments_[0];
  };
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

/**
 * Compute length of str not including ANSI escape codes.
 * See http://en.wikipedia.org/wiki/ANSI_escape_code#graphics.
 *
 * @param {*} string
 */
function textLength(string) {
  return string.replace(/\u001B\[(?:\d{1,3})(?:;\d{1,3})*m/g, '').length;
}

function header(text, level, style) {
  return ` ${style(level < 3 ? text.toUpperCase() : text)}`;
}

module.exports = {
  list,
  identity,
  sanitizeTab,
  insertEmojis,
  unescapeEntities,
  compose,
  undoColon,
  section,
  indentify,
  highlight,
  indentLines,
  generateTableRow,
  hr,
  fixNestedLists,
  textLength,
  header,
};
