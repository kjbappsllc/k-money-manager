const Table = require('cli-table');

const tableStyle = { head: ['yellow'], border: ['blue'] };

const tableCharactersContent = {
  top: '═',
  'top-mid': '╤',
  'top-left': '╔',
  'top-right': '╗',
  bottom: '═',
  'bottom-mid': '╧',
  'bottom-left': '╚',
  'bottom-right': '╝',
  left: '║',
  'left-mid': '╟',
  mid: '─',
  'mid-mid': '┼',
  right: '║',
  'right-mid': '╢',
  middle: '│'
};

const tableCharactersHeaderBody = {
  top: '',
  'top-mid': '',
  'top-left': '',
  'top-right': '',
  bottom: '',
  'bottom-mid': '',
  'bottom-left': '',
  'bottom-right': '',
  left: '║',
  'left-mid': '||',
  mid: '',
  'mid-mid': '',
  right: '║',
  'right-mid': '||',
  middle: ''
};

const tableCharactersHeaderTop = {
  top: '═',
  'top-mid': '=',
  'top-left': '╔',
  'top-right': '╗',
  bottom: '',
  'bottom-mid': '',
  'bottom-left': '',
  'bottom-right': '',
  left: '║',
  'left-mid': '||',
  mid: '─',
  'mid-mid': '┼',
  right: '║',
  'right-mid': '||',
  middle: '│'
};

const charTypes = {
  headerTop: {
    chars: tableCharactersHeaderTop,
    style: { head: ['yellow'], border: ['blue'] }
  },
  headerBody: {
    chars: tableCharactersHeaderBody,
    style: { head: ['cyan'], border: ['green'] }
  },
  content: {
    chars: tableCharactersContent,
    style: { head: ['yellow'], border: ['blue'] }
  }
};

module.exports = {
  createTable: (charsType, headers, widths) => {
    return new Table({
      chars: charsType.chars,
      head: headers,
      colWidths: widths,
      style: charsType.style
    });
  },
  cTypes: charTypes
};
