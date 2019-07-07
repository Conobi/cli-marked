#!/usr/bin/env node
const fs = require('fs');
const concat = require('concat-stream');

const marked = require('marked');
const TerminalRenderer = require('./');
const chalk = require('chalk');

const c = {
  heading: chalk.bold.cyan,
  firstHeading: chalk.bold.cyan,
  html: chalk.grey,
  strong: chalk.bold.blue,
  em: chalk.italic.magenta,
  codespan: chalk.yellow,
  del: chalk.strikethrough.red,
  link: chalk.blue,
  href: chalk.blue.underline,
  blockquote: chalk.gray,
};

marked.setOptions({
  renderer: new TerminalRenderer(c),
});


const input = process.argv.length > 2
  ? fs.createReadStream(process.argv[2])
  : process.stdin;

// Force colors for chalk.
process.argv.push('--color');

input.pipe(concat((markdown) => {
  process.stdout.write(marked(markdown.toString()));
}));
