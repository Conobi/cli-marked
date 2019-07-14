/* eslint-disable class-methods-use-this */
/* eslint-disable jsdoc/require-example */
/* eslint-disable jsdoc/require-returns */
/** @typedef {import('chalk')} Chalk  */
const Table = require('cli-table3');
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
  hr,
  header,
  wrapWords,
  removeNewLines,
  semiSection,
} = require('./lib/functions');


const {
  BULLET_POINT,
  BULLET_DONE,
  BULLET_UNDONE,
  HEADER_SYMBOL,
} = require('./lib/constants');

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
  unescape: true,

};

class Renderer {
  constructor(options) {
    this.o = { ...defaultOptions, ...options };
    this.indent = sanitizeTab(this.o.indent, defaultOptions.indent);
    this.smallIndent = sanitizeTab(this.o.smallIndent, defaultOptions.smallIndent);
    this.emoji = this.o.emoji ? insertEmojis : identity;
    this.unescape = this.o.unescape ? unescapeEntities : identity;
    this.transform = compose(undoColon, this.unescape, this.emoji);
    this.row = [];
    this.tableContent = [];
  }

  /**
   *
   * @param {*} text
   */
  text(text) {
    const transform = compose(
      this.o.text,
      wrapWords,

      removeNewLines,
    );

    return transform(text);
  }

  /**
   *
   * @param {*} text
   */
  paragraph(text) {
    const transform = compose(
      section,
      this.o.paragraph,
      this.transform,
    );

    return transform(text);
  }

  /**
   *
   * @param {*} code
   * @param {*} lang
   * @param {*} escaped
   */
  code(code, lang, escaped) {
    const transform = compose(
      section,
      string => indentify(this.o.smallIndent, highlight(string, lang, this.o)),
    );

    return transform(code);
  }

  /**
   *
   * @param {*} text
   */
  codespan(text) {
    const transform = compose(
      string => this.o.codespan(string),
      this.transform,
    );

    return transform(text);
  }

  /**
   * FIXME: I'm not sure that this works i all cases.
   *
   * @param {*} html
   */
  html(html) {
    const transform = compose(
      string => this.o.html(string),
    );

    return transform(html);
  }

  /**
   *
   * @param {*} quote
   */
  blockquote(quote) {
    const transform = compose(
      section,
      string => indentify(
        this.o.blockquote('│ '),
        this.o.blockquoteText(string.trim()),
      ),
    );

    return transform(quote);
  }


  /**
   *
   * @param {*} text
   * @param {*} level
   * @param {*} raw
   */
  heading(text, level, raw) {
    const transform = compose(
      section,
      header,
      this.transform,
      string => this.o.headers[level - 1](string),
    );

    return transform(`${HEADER_SYMBOL} ${text}`);
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
    const transform = compose(
      section,
      string => list(string, ordered, this.indent),
      string => indentLines(this.indent, string),
    );

    return transform(body);
  }

  /**
   *
   * @param {*} text
   */
  listitem(text, checkboxes) {
    const transform = compose(
      semiSection,
      this.transform,
    );

    const bullet = this.o.listitem(BULLET_POINT);

    const isNested = text.includes('\n');
    if (isNested) { text = text.trim(); }
    if (checkboxes) {
      return transform(text);
    }

    return transform(bullet + text);
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
   * @param {*} header
   * @param {*} body
   */
  table(header, body) {
    const transform = compose(
      section,
      string => this.o.table(string),
    );

    const table = new Table(({
      head: this.tableContent.shift(),
    }));
    this.tableContent.forEach((row) => {
      table.push(row);
    });
    this.tableContent = [];

    return transform(table.toString());
  }

  /**
   *
   * @param {*} content
   */
  tablerow(content) {
    this.tableContent.push(this.row);
    this.row = [];
    return '';
  }

  /**
   *
   * @param {*} content
   * @param {*} flags
   */
  tablecell(content, flags) {
    this.row.push({ content, hAlign: flags.align });
    return '';
  }

  /**
   * Span level renderer.
   *
   * @param {*} text
   */
  strong(text) {
    const transform = compose(
      string => this.o.strong(string),
    );

    return transform(text);
  }

  /**
   *
   * @param {*} text
   */
  em(text) {
    const transform = compose(
      string => this.o.em(string),
    );

    return transform(text);
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
    const transform = compose(
      string => this.o.del(string),
    );

    return transform(text);
  }

  /**
   *
   * @param {*} href
   * @param {*} title
   * @param {*} text
   */
  link(href, title, text) {
    // eslint-disable-next-line no-script-url
    if (href.indexOf('javascript:') === 0) {
      return '';
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
      out = this.o.href(ansiEscapes.link(link, href));
    } else {
      if (hasText) { out += `${this.o.link(this.emoji(text))} (`; }
      out += this.o.href(href);
      if (hasText) { out += ')'; }
    }

    return out;
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
