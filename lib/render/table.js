const compose = require('compose-function');
const Table = require('cli-table3');

const {
  section,
} = require('../utils');

/**
 *
 * @param {object} tableContent
 * @param {object[][]} tableContent.table
 * @param {object[]} tableContent.row
 * @param {*} style
 * @returns {string}
 */
function renderTable(tableContent, style) {
  const transform = compose(
    section,
    string => style(string),
  );

  const table = new Table({
    head: tableContent.table.shift(),
  });

  tableContent.table.forEach((row) => {
    table.push(row);
  });

  // eslint-disable-next-line no-param-reassign
  tableContent.table = [];

  return transform(table.toString());
}

/**
 *
 * @param {object} tableContent
 * @param {object[][]} tableContent.table
 * @param {object[]} tableContent.row
 * @returns {string}
 */
function renderTablerow(tableContent) {
  tableContent.table.push(tableContent.row);
  // eslint-disable-next-line no-param-reassign
  tableContent.row = [];
  return '';
}

/**
 *
 * @param {object} tableContent
 * @param {object[][]} tableContent.table
 * @param {object[]} tableContent.row
 * @param {*} content
 * @param {*} flags
 * @returns {string}
 */
function renderTablecell(tableContent, content, flags) {
  tableContent.row.push({ content, hAlign: flags.align });
  return '';
}

module.exports = {
  renderTable,
  renderTablerow,
  renderTablecell,
};
