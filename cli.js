#!/usr/bin/env node
const fs = require('fs');
const concat = require('concat-stream');
const marked = require('marked');
const chalk = require('chalk');

const TerminalRenderer = require('./');


const c = {
};

marked.setOptions({
  renderer: new TerminalRenderer(c),
  gfm: true,
  breaks: true,
  mangle: false,
  smartypants: true,
});


const input = process.argv.length > 2
  ? fs.createReadStream(process.argv[2])
  : process.stdin;

// Force colors for chalk.
process.argv.push('--color');

input.pipe(concat((markdown) => {
  process.stdout.write(marked(markdown.toString(), {
    gfm: true,
  }));
}));
