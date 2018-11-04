#!/usr/bin/env node

const clear = require('clear');

const chalk = require('chalk');

const figlet = require('figlet');

const utils = require('./lib/Utilities');

const pkg = require('./package.json');

const _ = require('lodash');

const app = require('commander');

///Main Application Commands
app
  .version(pkg.version, '-V, --version')
  .usage('<command> [options]')
  .description('Budget Management System');
app
  .command('init')
  .alias('i')
  .description('Initialize your budget')
  .action(() => {
    initInformation();
  });
app
  .command('add')
  .alias('a')
  .description('Add to your budget')
  .action(() => {
    initiateAddCommand();
  });
app
  .command('view')
  .alias('v')
  .option('-a, --all', 'View all of your budget details')
  .description('View your budget')
  .action(cmd => {
    initiateViewCommand(cmd.all);
    utils.logState(process.argv[2]);
  });
app
  .command('pay')
  .alias('p')
  .option('-r, --reverse', 'Unpay yourself')
  .description(
    'Pay yourself and allocate your money according to your allocations'
  )
  .action(cmd => {
    utils.dataManager.pay(cmd.reverse);
    utils.logState(process.argv[2]);
  });
app
  .command('spend')
  .alias('s')
  .description('Spend your money, but do so wisely')
  .action(() => {
    initiateSpendCommand()
  });
app
  .command('allocate')
  .alias('al')
  .description(
    'Allocate any of your remaining unallocated total balance to an entry'
  )
  .action(() => {
    initiateAllocateCommand();
    utils.logState(process.argv[2]);
  });

app.parse(process.argv);

///Utility Functions
function addBanner() {
  console.log(
    chalk.blueBright.bold(
      figlet.textSync('KMM', { horizontalLayout: 'full' })
    )
  );
}

function initInformation() {
  utils.prompts.initialization().then(info => {
    utils.dataManager.initData(info);
    clear();
    addBanner();
    console.log(
      chalk.green(utils.unicodes.checkmark + ' You are all set!'),
      chalk.yellowBright.bold(
        "\nFor help on how to use the interface enter 'bdgt -h'"
      )
    );
  });
}

function initiateAddCommand() {
  utils.prompts.add().then(info => {
    if (info.addChoice === utils.dataManager.constants.ADD_ENTRY) {
      utils.dataManager.addEntry(info);
      console.log(
        chalk.green('\n' + utils.unicodes.smilyFace + ' Entry has been added')
      );
      console.log(
        chalk.yellowBright(
          'You now have ',
          utils.dataManager.getUnallocatedMoney().formatCurrency(),
          ' left to allocate!'
        )
      );
    } else {
      utils.dataManager.addCategory(info);
    }
  });
}

function initiateViewCommand(allOptionSet) {
  if (allOptionSet) {
    displaySeparator();
    displayAllocatedSalary(true);
    displayBiweeklyUnallocatedMoney(true);
    displayTotalBalance(true);
    displayTotalEntryBalance(true);
    displayTotalUnallocatedMoney(true);

    let topHeader = utils.tableFactory.createTable(
      utils.tableFactory.cTypes.content,
      ['Full List'],
      [73]
    );

    console.log(topHeader.toString());

    let allData = utils.dataManager.getAllData();
    _.forIn(allData, (value, key) => {
      let category = key;
      let header = utils.tableFactory.createTable(
        utils.tableFactory.cTypes.headerBody,
        [category],
        [73]
      );
      let content = utils.tableFactory.createTable(
        utils.tableFactory.cTypes.content,
        ['Category', 'Name', 'Allocated', 'Balance'],
        [20, 20, 15, 15]
      );
      console.log(header.toString());
      _.forIn(value, (value, key) => {
        content.push([
          category,
          key,
          Number(value.allocation).formatCurrency(),
          Number(value.balance).formatCurrency()
        ]);
      });
      console.log(content.toString());
    });
    return;
  }

  utils.prompts.view().then(info => {
    switch (info.viewType) {
      case 'Total Balance': {
        displayTotalBalance();
        break;
      }
      case 'Allocated': {
        displayAllocatedSalary();
        break;
      }
      default: {
        let header = utils.tableFactory.createTable(
          utils.tableFactory.cTypes.headerTop,
          [info.viewType],
          [52]
        );

        let content = utils.tableFactory.createTable(
          utils.tableFactory.cTypes.content,
          ['Name', 'Allocated', 'Balance'],
          [20, 15, 15]
        );

        _.forIn(utils.dataManager.getEntriesOf(info.viewType), (value, key) => {
          content.push([
            key,
            Number(value.allocation).formatCurrency(),
            Number(value.balance).formatCurrency()
          ]);
        });
        console.log(header.toString());
        console.log(content.toString());
        break;
      }
    }
  });
}
function initiateSpendCommand() {
  utils.prompts.spend().then(info => {
    utils.dataManager.spend(info.category, info.entry, info.amount);
    delete info.category
    utils.logState('spend', info);
  });
}

function initiateAllocateCommand() {
  utils.prompts.allocate().then(info => {
    utils.dataManager.allocateToEntry(info.category, info.entry, info.amount);
  });
}
//////////////////////////////////
/*Display Functions*/
////////////////////////////////
function displaySeparator() {
  console.log('--------');
}
function displayAllocatedSalary(withSeparator) {
  console.log(
    'You have',
    chalk.green(Number(utils.dataManager.getAllocatedMoney()).formatCurrency()),
    'of your',
    chalk.yellowBright.bold('biweekly salary allocated'),
    'to entries'
  );
  if (withSeparator) {
    displaySeparator();
  }
}
function displayTotalEntryBalance(withSeparator) {
  console.log(
    'You have',
    chalk.green(
      Number(utils.dataManager.getTotalEntryBalance()).formatCurrency()
    ),
    'as the',
    chalk.yellowBright.bold('total balance of your entries')
  );
  if (withSeparator) {
    displaySeparator();
  }
}
function displayTotalBalance(withSeparator) {
  console.log(
    'You have',
    chalk.green(Number(utils.dataManager.getTotalBalance()).formatCurrency()),
    'as your',
    chalk.yellowBright.bold('total balance')
  );
  if (withSeparator) {
    displaySeparator();
  }
}
function displayTotalUnallocatedMoney(withSeparator) {
  let colorMark;
  let totalUnallocatedMoney = utils.dataManager.getTotalUnallocatedMoney();
  if (totalUnallocatedMoney !== 0) {
    colorMark = chalk.red;
  } else {
    colorMark = chalk.green;
  }
  console.log(
    'You have',
    colorMark(totalUnallocatedMoney.formatCurrency()),
    'of your',
    chalk.yellowBright.bold('total balance unallocated')
  );
  if (withSeparator) {
    displaySeparator();
  }
}
function displayBiweeklyUnallocatedMoney(withSeparator) {
  let colorMark;
  let totalUnallocatedMoney = utils.dataManager.getUnallocatedMoney();
  if (totalUnallocatedMoney !== 0) {
    colorMark = chalk.red;
  } else {
    colorMark = chalk.green;
  }
  console.log(
    'You have',
    colorMark(totalUnallocatedMoney.formatCurrency()),
    'of your',
    chalk.yellowBright.bold('biweekly income unallocated')
  );
  if (withSeparator) {
    displaySeparator();
  }
}
