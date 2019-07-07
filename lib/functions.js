/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-example */
const emoji = require('node-emoji');
const chalk = require('chalk');
const { highlight: cliHighlight } = require('cli-highlight');


const {
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP_REGEXP,
  COLON_REPLACER_REGEXP,
  TAB_ALLOWED_CHARACTERS,
  HARD_RETURN,
  HARD_RETURN_RE,
  HARD_RETURN_GFM_RE,
  POINT_REGEX,
  BULLET_POINT,
} = require('./constants');

/**
 *
 * @param {*} text
 * @param {*} reflow
 */
function fixHardReturn(text, reflow) {
  return reflow ? text.replace(HARD_RETURN, /\n/g) : text;
}

/**
 * Munge \n's and spaces in "text" so that the number of
 * characters between \n's is less than or equal to "width".
 *
 * @param {*} text
 * @param {*} width
 * @param {*} gfm
 */
function reflowText(text, width, gfm) {
  // Hard break was inserted by Renderer.prototype.br or is
  // <br /> when gfm is true
  const splitRe = gfm ? HARD_RETURN_GFM_RE : HARD_RETURN_RE;
  const sections = text.split(splitRe);
  const reflowed = [];

  sections.forEach((section) => {
    // Split the section by escape codes so that we can
    // deal with them separately.
    const fragments = section.split(/(\u001B\[(?:\d{1,3})(?:;\d{1,3})*m)/g);
    let column = 0;
    let currentLine = '';
    let lastWasEscapeChar = false;

    while (fragments.length) {
      const fragment = fragments[0];

      if (fragment === '') {
        fragments.splice(0, 1);
        lastWasEscapeChar = false;
        continue;
      }

      // This is an escape code - leave it whole and
      // move to the next fragment.
      if (!textLength(fragment)) {
        currentLine += fragment;
        fragments.splice(0, 1);
        lastWasEscapeChar = true;
        continue;
      }

      const words = fragment.split(/[ \t\n]+/);

      // eslint-disable-next-line no-restricted-syntax
      for (const word of words) {
        let addSpace = column != 0;
        if (lastWasEscapeChar) addSpace = false;

        // If adding the new word overflows the required width
        if (column + word.length + addSpace > width) {
          if (word.length <= width) {
            // If the new word is smaller than the required width
            // just add it at the beginning of a new line
            reflowed.push(currentLine);
            currentLine = word;
            column = word.length;
          } else {
            // If the new word is longer than the required width
            // split this word into smaller parts.
            var w = word.substr(0, width - column - addSpace);
            if (addSpace) currentLine += ' ';
            currentLine += w;
            reflowed.push(currentLine);
            currentLine = '';
            column = 0;

            word = word.substr(w.length);
            while (word.length) {
              var w = word.substr(0, width);

              if (!w.length) break;

              if (w.length < width) {
                currentLine = w;
                column = w.length;
                break;
              } else {
                reflowed.push(w);
                word = word.substr(width);
              }
            }
          }
        } else {
          if (addSpace) {
            currentLine += ' ';
            column++;
          }

          currentLine += word;
          column += word.length;
        }

        lastWasEscapeChar = false;
      }

      fragments.splice(0, 1);
    }

    if (textLength(currentLine)) reflowed.push(currentLine);
  });

  return reflowed.join('\n');
}

/**
 *
 * @param {*} string
 */
function identity(string) {
  return string;
}


/**
 *
 * @param {*} indent
 * @param {*} text
 */
function indentLines(indent, text) {
  return text.replace(/(^|\n)(.+)/g, `$1${indent}$2`);
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
  return line.match(`^(?:${indent})*${POINT_REGEX}`);
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
  return isPointedLine(line, indent) ? line : line;
}

/**
 *
 * @param {*} lines
 * @param {*} indent
 */
function bulletPointLines(lines, indent) {
  return lines.split('\n')
    .filter(identity)
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
  return (
    line.replace(BULLET_POINT, numberedPoint(number + 1))
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
    .map((line, index) => {
      const numbered = numberedLine(indent, line, index);
      return numbered;
    })
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
  return bodyClean;
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
 * @param {*} hightlightOptions
 */
function highlight(code, lang, options, hightlightOptions) {
  if (!chalk.enabled) return code;

  const style = options.code;

  const codeFixed = fixHardReturn(code, options.reflowText);

  try {
    return cliHighlight(codeFixed, { language: lang, ignoreIllegals: true });
  } catch (error) {
    return style(codeFixed);
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
  if (typeof tab === 'number') {
    return (new Array(tab + 1)).join(' ');
  } if (typeof tab === 'string' && isAllowedTabString(tab)) {
    return tab;
  }
  return (new Array(fallbackTab + 1)).join(' ');
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
  fixHardReturn,
  highlight,
  reflowText,
  indentLines,
  generateTableRow,
  hr,
  fixNestedLists,
  textLength,
};
