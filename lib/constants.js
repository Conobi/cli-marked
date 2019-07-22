const figures = require('figures');
/**
 *
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

const TABLE_CELL_SPLIT = '^*||*^';
const TABLE_ROW_WRAP = '*|*|*|*';
const TABLE_ROW_WRAP_REGEXP = new RegExp(escapeRegExp(TABLE_ROW_WRAP), 'g');

const COLON_REPLACER = '*#COLON|*';
const COLON_REPLACER_REGEXP = new RegExp(escapeRegExp(COLON_REPLACER), 'g');

const TAB_ALLOWED_CHARACTERS = ['\t'];


const BULLET_POINT = '•';
const BULLET_POINT_REGEX = escapeRegExp(BULLET_POINT);

const NUMBERED_POINT_REGEX = '\\d+\\.';

const POINT_REGEX = `(?:${[BULLET_POINT_REGEX, NUMBERED_POINT_REGEX].join('|')})`;


const BULLET_DONE = figures.tick;
const BULLET_UNDONE = figures.cross;

const BULLETS_REGEX = `(?:${[escapeRegExp(BULLET_DONE), escapeRegExp(BULLET_UNDONE)].join('|')})`;

const HEADER_SYMBOL = '§';


module.exports = {
  BULLET_DONE,
  BULLET_POINT_REGEX,
  BULLET_POINT,
  BULLET_UNDONE,
  BULLETS_REGEX,
  COLON_REPLACER_REGEXP,
  COLON_REPLACER,
  escapeRegExp,
  HEADER_SYMBOL,
  NUMBERED_POINT_REGEX,
  POINT_REGEX,
  TAB_ALLOWED_CHARACTERS,
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP_REGEXP,
  TABLE_ROW_WRAP,
};
