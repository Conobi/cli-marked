/* eslint-disable class-methods-use-this */
/* eslint-disable jsdoc/require-example */
/* eslint-disable jsdoc/require-returns */
/** @typedef {import('chalk')} chalk  */
const chalk = require('chalk');
const Table = require('cli-table');
const ansiEscapes = require('ansi-escapes');
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
} = require('./lib/functions');


const {
  TABLE_CELL_SPLIT,
  TABLE_ROW_WRAP,
  COLON_REPLACER,
  HARD_RETURN,
  BULLET_POINT,
  BULLET_DONE,
  BULLET_UNDONE,
} = require('./lib/constants');

const defaultOptions = {
  code: chalk.yellow,
  blockquote: chalk.gray.italic,
  blockquoteText: chalk.reset.dim.italic,
  html: chalk.gray,
  firstHeading: chalk.magenta.underline.bold,
  heading: chalk.green.underline.bold,
  hr: chalk.reset,
  listitem: chalk.magenta,
  table: chalk.reset,
  strong: chalk.red.bold,
  em: chalk.red.italic,
  codespan: chalk.yellow,
  del: chalk.dim.reset.strikethrough,
  link: chalk.blue,
  href: chalk.blue.underline,
  doneMark: chalk.green.bold,
  undoneMark: chalk.red.bold,
  paragraph: identity,
  text: identity,
  unescape: true,
  emoji: true,
  breaks: true,
  showSectionPrefix: true,
  tab: 2,
  tableOptions: {},
};

class Renderer {
  constructor(options, highlightOptions) {
    this.o = { ...defaultOptions, ...options };
    this.tab = sanitizeTab(this.o.tab, defaultOptions.tab);
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
    return section(indentify(this.tab, highlight(code, lang, this.o, this.highlightOptions)));
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
   * @param {*} html
   */
  html(html) {
    return this.o.html(html);
  }

  /**
   *
   * @param {*} text
   * @param {*} level
   * @param {*} raw
   */
  heading(text, level, raw) {
    text = this.transform(text);
    const prefix = this.o.showSectionPrefix
      ? `${(new Array(level + 1)).join('#')} ` : '';
    text = prefix + text;
    return section(level === 1 ? this.o.firstHeading(text) : this.o.heading(text));
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
  list(body, ordered ) {
    // return `>${section(body)}>`;
    body = `${indentLines(this.tab, body)}`;
    return section(list(body, ordered, this.tab));
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
   * @param {*} text
   */
  codespan(text) {
    return this.o.codespan(text.replace(/:/g, COLON_REPLACER));
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
    return `${out}]`;
  }
}


module.exports = Renderer;
