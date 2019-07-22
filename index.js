/* eslint-disable jsdoc/require-returns,jsdoc/require-example,class-methods-use-this */
const compose = require('compose-function');
const marked = require('marked');

const { renderLink } = require('./lib/render/link');
const { renderImage } = require('./lib/render/image');
const { renderCode, renderCodespan } = require('./lib/render/code');
const { renderListItem, renderList } = require('./lib/render/list');
const { renderHeading } = require('./lib/render/heading');
const { renderBlockquote } = require('./lib/render/blockquote');
const { renderTable, renderTablerow, renderTablecell } = require('./lib/render/table');

const {
  section,
  hr,
  wrapWords,
  removeNewLines,
  undoColon,
  unescapeEntities,
  insertEmojis,
} = require('./lib/utils');
const defaultOptions = require('./lib/options');


class Renderer extends marked.Renderer {
  constructor(options) {
    super();
    this.o = { ...defaultOptions, ...options };

    this.tableContent = {
      table: [],
      row: [],
    };
  }

  text(text) {
    const transform = compose(
      this.o.text,
      undoColon,
      unescapeEntities,
      removeNewLines,
      insertEmojis,
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
    return renderCode(code, lang, escaped, this.o.code, this.o.smallIndent);
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
    return renderBlockquote(quote, {
      blockquote: this.o.blockquote,
      blockquoteText: this.o.blockquoteText,
    });
  }

  heading(text, level) {
    return renderHeading(text, level, this.o.headers[level - 1], this.o.smallIndent);
  }

  hr() {
    return section(this.o.hr(hr('─', this.o.width)));
  }

  list(body, ordered) {
    return renderList(body, ordered, this.o.indent);
  }

  listitem(text, checkboxes, checked) {
    return renderListItem(text, checkboxes, checked, {
      listitem: this.o.listitem,
      doneMark: this.o.doneMark,
      undoneMark: this.o.undoneMark,
    });
  }

  checkbox() {
    return '';
  }

  table() {
    return renderTable(this.tableContent, this.o.table);
  }

  tablerow() {
    return renderTablerow(this.tableContent);
  }

  tablecell(content, flags) {
    return renderTablecell(this.tableContent, content, flags);
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
