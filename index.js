/* eslint-disable class-methods-use-this */
/* eslint-disable jsdoc/require-example */
/* eslint-disable jsdoc/require-returns */
/** @typedef {import('chalk')} chalk  */
const Table = require('cli-table');
const ansiEscapes = require('ansi-escapes');
const ansiStyles = require('ansi-colors');
const supportsHyperlinks = require('supports-hyperlinks');

const {
  list,
  identity,
  insertEmojis,
  unescapeEntities,
  compose,
  undoColon,
  section,
  indentify,
  highlight,
  sanitizeTab,
  indentLines,
  generateTableRow,
  hr,
  header,
} = require('./lib/functions');


const {
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP,
  COLON_REPLACER,
  BULLET_POINT,
  BULLET_DONE,
  BULLET_UNDONE,
  HEADER_SYMBOL,
} = require('./lib/constants');

const defaultOptions = {
  code: string => ansiStyles.yellow(string),
  blockquote: string => ansiStyles.gray.italic(string),
  blockquoteText: string => ansiStyles.dim.italic(string),
  html: string => ansiStyles.gray(string),
  headers: [
    string => ansiStyles.red.underline.bold(string),
    string => ansiStyles.yellow.underline.bold(string),
    string => ansiStyles.yellow.underline.bold(string),
    string => ansiStyles.green.underline(string),
    string => ansiStyles.green(string),
    string => ansiStyles.green.dim(string),
  ],
  hr: string => ansiStyles.dim(string),
  listitem: string => ansiStyles.magenta(string),
  table: string => ansiStyles.reset(string),
  strong: string => ansiStyles.red.bold(string),
  em: string => ansiStyles.green(string),
  codespan: string => ansiStyles.yellow(string),
  del: string => ansiStyles.dim.reset.strikethrough(string),
  link: string => ansiStyles.blue(string),
  href: string => ansiStyles.blue.underline(string),
  image: string => ansiStyles.cyan(string),
  doneMark: string => ansiStyles.green.bold(string),
  undoneMark: string => ansiStyles.red.bold(string),
  paragraph: identity,
  text: identity,
  unescape: true,
  emoji: true,
  breaks: true,
  indent: '  ',
  smallIndent: ' ',
  tableOptions: {},
};

class Renderer {
  constructor(options, highlightOptions) {
    this.o = { ...defaultOptions, ...options };
    this.indent = sanitizeTab(this.o.indent, defaultOptions.indent);
    this.smallIndent = sanitizeTab(this.o.smallIndent, defaultOptions.smallIndent);
    this.tableSettings = this.o.tableOptions;
    this.emoji = this.o.emoji ? insertEmojis : identity;
    this.unescape = this.o.unescape ? unescapeEntities : identity;
    this.highlightOptions = highlightOptions || {};
    this.transform = compose(undoColon, this.unescape, this.emoji);
  }

  /**
   *
   * @param {*} text
   */
  text(text) {
    return this.o.text(text);
  }

  /**
   *
   * @param {*} code
   * @param {*} lang
   * @param {*} escaped
   */
  code(code, lang, escaped) {
    return section(indentify(this.o.smallIndent, highlight(code, lang, this.o, this.highlightOptions)));
  }

  /**
   *
   * @param {*} text
   */
  codespan(text) {
    return this.o.codespan(`\`${text.replace(/:/g, COLON_REPLACER)}\``);
  }

  /**
   * FIXME: I'm not sure that this works i all cases.
   *
   * @param {*} html
   */
  html(html) {
    return this.o.html(html);
  }

  /**
   *
   * @param {*} quote
   */
  blockquote(quote) {
    return section(indentify(
      this.o.blockquote('│ '),
      this.o.blockquoteText(quote.trim()),
    ));
  }


  /**
   *
   * @param {*} text
   * @param {*} level
   * @param {*} raw
   */
  heading(text, level, raw) {
    text = this.transform(text);
    const prefix = `${HEADER_SYMBOL} `;
    text = prefix + text;
    return section(header(text, level, this.o.headers[level - 1]));
  }

  /**
   *
   */
  hr() {
    return section(this.o.hr(hr('─', this.o.width)));
  }

  /**
   *
   * @param {*} body
   * @param {*} ordered
   */
  list(body, ordered) {
    // return `>${section(body)}>`;
    body = `${indentLines(this.indent, body)}`;
    return section(list(body, ordered, this.indent));
  }

  /**
   *
   * @param {*} text
   */
  listitem(text, checkboxes) {
    // console.log('++++---', argument);
    const transform = compose(this.transform);
    const isNested = text.includes('\n');
    if (isNested) { text = text.trim(); }
    if (checkboxes) {
      return `\n${transform(text)}`;
    }
    // Use BULLET_POINT as a marker for ordered or unordered list item
    return `\n${this.o.listitem(BULLET_POINT)}${transform(text)}`;
  }

  /**
   * @param {any} checked
   */
  checkbox(checked) {
    return `${checked
      ? this.o.doneMark(BULLET_DONE)
      : this.o.undoneMark(BULLET_UNDONE)} `;
  }

  /**
   *
   * @param {*} text
   */
  paragraph(text) {
    const transform = compose(this.o.paragraph, this.transform);
    text = transform(text);
    return section(text);
  }

  /**
   *
   * @param {*} header
   * @param {*} body
   */
  table(header, body) {
    const table = new Table(({
      ...{
        head: generateTableRow(header)[0],
      },
      ...this.tableSettings,
    }));
    generateTableRow(body, this.transform).forEach((row) => {
      table.push(row);
    });
    return section(this.o.table(table.toString()));
  }

  /**
   *
   * @param {*} content
   */
  tablerow(content) {
    return `${TABLE_ROW_WRAP + content + TABLE_ROW_WRAP}\n`;
  }

  /**
   *
   * @param {*} content
   * @param {*} flags
   */
  tablecell(content, flags) {
    return content + TABLE_CELL_SPLIT;
  }

  /**
   * Span level renderer.
   *
   * @param {*} text
   */
  strong(text) {
    return this.o.strong(text);
  }

  /**
   *
   * @param {*} text
   */
  em(text) {
    return this.o.em(text);
  }


  /**
   *
   */
  br() {
    return '\n';
  }

  /**
   *
   * @param {*} text
   */
  del(text) {
    return this.o.del(text);
  }

  /**
   *
   * @param {*} href
   * @param {*} title
   * @param {*} text
   */
  link(href, title, text) {
    let prot;
    if (this.o.sanitize) {
      try {
        prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase();
      } catch (error) {
        return '';
      }
      // eslint-disable-next-line no-script-url
      if (prot.indexOf('javascript:') === 0) {
        return '';
      }
    }
    const hasText = text && text !== href;
    let out = '';
    if (supportsHyperlinks.stdout) {
      let link = '';
      if (text) {
        link = this.emoji(text);
      } else {
        link = href;
      }
      if (title) { link += ` – ${title}`; }
      link = this.o.href(link);
      out = ansiEscapes.link(link, href);
    } else {
      if (hasText) { out += `${this.emoji(text)} (`; }
      out += this.o.href(href);
      if (hasText) { out += ')'; }
    }
    return this.o.link(out);
  }

  /**
   *
   * @param {*} href
   * @param {*} title
   * @param {*} text
   */
  image(href, title, text) {
    let out = `![${text}`;
    if (title) { out += ` – ${title}`; }
    return this.o.image(`${out}]`);
  }
}


module.exports = Renderer;
