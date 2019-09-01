#!/usr/bin/env node

const fs = require('fs');
const concat = require('concat-stream');
const marked = require('marked');

const TerminalRenderer = require('..');

marked.setOptions({
  renderer: new TerminalRenderer({}),
  mangle: false,
  emoji: true,
  breaks: false,
  gfm: true,
  smartypants: false,
});

const input = process.argv.length > 2
  ? fs.createReadStream(process.argv[2])
  : process.stdin;

input.pipe(concat((markdown) => {
  process.stdout.write(marked(markdown.toString()));
}));
