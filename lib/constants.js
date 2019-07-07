
/**
 *
 * @param {*} string
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

// HARD_RETURN holds a character sequence used to indicate text has a
// hard (no-reflowing) line break.  Previously \r and \r\n were turned
// into \n in marked's lexer- preprocessing step. So \r is safe to use
// to indicate a hard (non-reflowed) return.
const HARD_RETURN = '\r';
const HARD_RETURN_RE = new RegExp(HARD_RETURN);
const HARD_RETURN_GFM_RE = new RegExp(`${HARD_RETURN}|<br />`);


const BULLET_POINT_REGEX = '\\*';
const NUMBERED_POINT_REGEX = '\\d+\\.';
const POINT_REGEX = `(?:${[BULLET_POINT_REGEX, NUMBERED_POINT_REGEX].join('|')})`;
const BULLET_POINT = '* ';


module.exports = {
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP,
  TABLE_ROW_WRAP_REGEXP,
  COLON_REPLACER,
  COLON_REPLACER_REGEXP,
  TAB_ALLOWED_CHARACTERS,
  HARD_RETURN,
  HARD_RETURN_RE,
  HARD_RETURN_GFM_RE,
  BULLET_POINT_REGEX,
  NUMBERED_POINT_REGEX,
  POINT_REGEX,
  BULLET_POINT,
};
