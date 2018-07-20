const { prompt } = require('inquirer');

const data = require('./Data');

const promptFactory = require('./PromptFactory');

const Unicodes = require('./Unicode');

const tableFactory = require('./TableFactory');

const fs = require('fs');

const path = require('path');

var exec = require('child_process').exec;

module.exports = {
  prompts: {
    initialization: () => {
      let initQuestions = promptFactory.generateInitQuestions();
      return prompt(initQuestions);
    },
    add: () => {
      let addQuestions = promptFactory.generateAddQuestions();
      return prompt(addQuestions);
    },
    view: () => {
      let viewQuestions = promptFactory.generateViewQuestions();
      return prompt(viewQuestions);
    },
    spend: () => {
      let spendQuestions = promptFactory.generateSpendQuestions();
      return prompt(spendQuestions);
    },
    allocate: () => {
      let allocateQuestions = promptFactory.generateAllocateQuestions();
      return prompt(allocateQuestions);
    }
  },
  dataManager: data,
  unicodes: Unicodes,
  tableFactory: tableFactory,
  logState: cmd => {
    var p = 'KMMLogs.txt';
    const d = new Date();
    const currStringTime =
      d.toLocaleDateString() + '  ' + d.toLocaleTimeString();
    const dataString = JSON.stringify(data.getAllData());
    buffer = new Buffer(
      currStringTime +
        ' -> ' +
        cmd +
        '\n--------------\n' +
        dataString +
        '\n--------------\n\n\n'
    );

    fs.appendFile(p, buffer, function(err) {
      if (err) throw err;
      exec('cp ./KMMLogs.txt ~/Desktop/');
    });
  }
};
