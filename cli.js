#!/usr/bin/env node
const fs = require('fs');
const marked = require('marked');

const TerminalRenderer = require('./');


const c = {
};

marked.setOptions({
  renderer: new TerminalRenderer(c),
});

if (process.argv.length < 3) {
  console.error('Give a file name');
  process.exit(-1);
}

console.log(marked(fs.readFileSync(process.argv[2]).toString()));
