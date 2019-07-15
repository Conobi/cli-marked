/**
 *
 * @param {string} string
 */
function escapeRegExp(string) {
  return string.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

const isUnicodeSupported = process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color';

const TABLE_CELL_SPLIT = '^*||*^';
const TABLE_ROW_WRAP = '*|*|*|*';
const TABLE_ROW_WRAP_REGEXP = new RegExp(escapeRegExp(TABLE_ROW_WRAP), 'g');

const COLON_REPLACER = '*#COLON|*';
const COLON_REPLACER_REGEXP = new RegExp(escapeRegExp(COLON_REPLACER), 'g');

const TAB_ALLOWED_CHARACTERS = ['\t'];


const BULLET_POINT = '• ';
const BULLET_POINT_REGEX = '•';

const NUMBERED_POINT_REGEX = '\\d+\\.';

const POINT_REGEX = `(?:${[BULLET_POINT_REGEX, NUMBERED_POINT_REGEX].join('|')})`;


let BULLET_DONE;
let BULLET_UNDONE;
if (isUnicodeSupported) {
  BULLET_DONE = '✔';
  BULLET_UNDONE = '✖';
} else {
  BULLET_DONE = '√';
  BULLET_UNDONE = '×';
}
const BULLETS_REGEX = `(?:${(BULLET_DONE)}|${(BULLET_UNDONE)})`;

const HEADER_SYMBOL = '§';


module.exports = {
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP,
  TABLE_ROW_WRAP_REGEXP,
  COLON_REPLACER,
  COLON_REPLACER_REGEXP,
  TAB_ALLOWED_CHARACTERS,
  BULLET_POINT_REGEX,
  NUMBERED_POINT_REGEX,
  POINT_REGEX,
  BULLET_POINT,
  BULLET_DONE,
  BULLET_UNDONE,
  BULLETS_REGEX,
  HEADER_SYMBOL,
};
