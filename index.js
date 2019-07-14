/* eslint-disable jsdoc/require-returns,jsdoc/require-example,class-methods-use-this */
const Table = require('cli-table3');
const ansiStyles = require('ansi-colors');
const compose = require('compose-function');

const marked = require('marked');
const {
  list,
  identity,
  section,
  indentify,
  sanitizeTab,
  indentList,
  hr,
  header,
  wrapWords,
  removeNewLines,
  cleanText,
} = require('./lib/utils');

const { renderLink } = require('./lib/link');
const { renderImage } = require('./lib/image');
const {
  renderCode,
  renderCodespan,
} = require('./lib/code');

const { renderListItem } = require('./lib/list');


const {
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

};

class Renderer extends marked.Renderer {
  constructor(options) {
    super();
    this.o = { ...defaultOptions, ...options };
    this.indent = sanitizeTab(this.o.indent, defaultOptions.indent);
    this.smallIndent = sanitizeTab(this.o.smallIndent, defaultOptions.smallIndent);

    this.row = [];
    this.tableContent = [];
  }

  text(text) {
    const transform = compose(
      this.o.text,
      cleanText,
      removeNewLines,
    );

    return transform(text);
  }

  paragraph(text) {
    const transform = compose(
      section,
      this.o.paragraph,
      wrapWords,
    );

    return transform(text);
  }

  code(code, lang, escaped) {
    return renderCode(code, lang, escaped, this.o.smallIndent);
  }

  codespan(text) {
    return renderCodespan(text, this.o.codespan);
  }

  html(html) {
    const transform = compose(
      string => this.o.html(string),
    );

    return transform(html);
  }

  blockquote(quote) {
    const transform = compose(
      section,
      indentify(this.o.blockquote('│ ')),
      string => this.o.blockquoteText(string.trim()),
    );

    return transform(quote);
  }


  heading(text, level, raw) {
    const transform = compose(
      section,
      header,
      cleanText,
      string => this.o.headers[level - 1](string),
    );

    return transform(`${HEADER_SYMBOL} ${text}`);
  }

  hr() {
    return section(this.o.hr(hr('─', this.o.width)));
  }

  list(body, ordered) {
    const transform = compose(
      section,
      string => list(string, ordered, this.indent),
      indentList(this.indent),
    );

    return transform(body);
  }

  listitem(text, checkboxes) {
    return renderListItem(text, checkboxes, this.o.listitem);
  }

  checkbox(checked) {
    return `${checked
      ? this.o.doneMark(BULLET_DONE)
      : this.o.undoneMark(BULLET_UNDONE)} `;
  }


  table() {
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

  tablerow() {
    this.tableContent.push(this.row);
    this.row = [];
    return '';
  }

  tablecell(content, flags) {
    this.row.push({ content, hAlign: flags.align });
    return '';
  }

  strong(text) {
    const transform = compose(
      string => this.o.strong(string),
    );

    return transform(text);
  }

  em(text) {
    const transform = compose(
      string => this.o.em(string),
    );

    return transform(text);
  }


  br() {
    return '\n';
  }

  del(text) {
    const transform = compose(
      string => this.o.del(string),
    );

    return transform(text);
  }

  link(href, title, text) {
    return renderLink(href, title, text, {
      href: this.o.href,
      link: this.o.link,
    });
  }

  image(href, title, text) {
    return renderImage(href, title, text, this.o.image);
  }
}


module.exports = Renderer;
