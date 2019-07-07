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
  fixHardReturn,
  highlight,
  reflowText,
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
} = require('./lib/constants');

const defaultOptions = {
  code: chalk.yellow,
  blockquote: chalk.gray,
  html: chalk.gray,
  heading: chalk.yellow.bold,
  firstHeading: chalk.magenta.underline.bold,
  hr: chalk.reset,
  listitem: chalk.magenta,
  table: chalk.reset,
  strong: chalk.bold,
  em: chalk.italic,
  codespan: chalk.yellow,
  del: chalk.dim.gray.strikethrough,
  link: chalk.blue,
  href: chalk.blue.underline,
  paragraph: chalk.white,
  text: chalk.white,
  unescape: true,
  emoji: true,
  width: 80,
  showSectionPrefix: true,
  reflowText: false,
  tab: 2,
  tableOptions: {},
};

class Renderer {
  constructor(options, highlightOptions) {
    this.options = ({ ...defaultOptions, ...options });
    this.tab = sanitizeTab(this.options.tab, defaultOptions.tab);
    this.tableSettings = this.options.tableOptions;
    this.emoji = this.options.emoji ? insertEmojis : identity;
    this.unescape = this.options.unescape ? unescapeEntities : identity;
    this.highlightOptions = highlightOptions || {};
    this.transform = compose(undoColon, this.unescape, this.emoji);
  }

  /**
   *
   * @param {*} text
   */
  text(text) {
    return this.options.text(text);
  }

  /**
   *
   * @param {*} code
   * @param {*} lang
   * @param {*} escaped
   */
  code(code, lang, escaped) {
    return section(indentify(this.tab, highlight(code, lang, this.options, this.highlightOptions)));
  }

  /**
   *
   * @param {*} quote
   */
  blockquote(quote) {
    return section(indentify(this.options.blockquote('│ '), quote.trim()));
  }

  /**
   *
   * @param {*} html
   */
  html(html) {
    return this.options.html(html);
  }

  /**
   *
   * @param {*} text
   * @param {*} level
   * @param {*} raw
   */
  heading(text, level, raw) {
    text = this.transform(text);
    const prefix = this.options.showSectionPrefix
      ? `${(new Array(level + 1)).join('#')} ` : '';
    text = prefix + text;
    if (this.options.reflowText) {
      text = reflowText(text, this.options.width, this.options.gfm);
    }
    return section(level === 1 ? this.options.firstHeading(text) : this.options.heading(text));
  }

  /**
   *
   */
  hr() {
    return section(this.options.hr(hr('-', this.options.reflowText && this.options.width)));
  }

  /**
   *
   * @param {*} body
   * @param {*} ordered
   */
  list(body, ordered) {
    body = `${indentLines(this.tab, body)}`;
    return section(list(body, ordered, this.tab));
  }

  /**
   *
   * @param {*} text
   */
  listitem(text) {
    // return '+' + text+'-\n'
    const transform = compose(this.transform);
    const isNested = text.includes('\n');
    if (isNested) { text = text.trim(); }
    // Use BULLET_POINT as a marker for ordered or unordered list item
    return `\n${this.options.listitem(BULLET_POINT)}${transform(text)}`;
  }

  /**
   * @param {any} checked
   */
  checkbox(checked) {
    return `[${checked ? 'X' : ' '}] `;
  }

  /**
   *
   * @param {*} text
   */
  paragraph(text) {
    const transform = compose(this.options.paragraph, this.transform);
    text = transform(text);
    if (this.options.reflowText) {
      text = reflowText(text, this.options.width, this.options.gfm);
    }
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
    return section(this.options.table(table.toString()));
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
    return this.options.strong(text);
  }

  /**
   *
   * @param {*} text
   */
  em(text) {
    text = fixHardReturn(text, this.options.reflowText);
    return this.options.em(text);
  }

  /**
   *
   * @param {*} text
   */
  codespan(text) {
    text = fixHardReturn(text, this.options.reflowText);
    return this.options.codespan(text.replace(/:/g, COLON_REPLACER));
  }

  /**
   *
   */
  br() {
    return this.options.reflowText ? HARD_RETURN : '\n';
  }

  /**
   *
   * @param {*} text
   */
  del(text) {
    return this.options.del(text);
  }

  /**
   *
   * @param {*} href
   * @param {*} title
   * @param {*} text
   */
  link(href, title, text) {
    let prot;
    if (this.options.sanitize) {
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
        link = this.options.href(this.emoji(text));
      } else {
        link = this.options.href(href);
      }
      out = ansiEscapes.link(link, href);
    } else {
      if (hasText) { out += `${this.emoji(text)} (`; }
      out += this.options.href(href);
      if (hasText) { out += ')'; }
    }
    return this.options.link(out);
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
    return `${out}]\n`;
  }
}


module.exports = Renderer;
