const _ = require('lodash');

const configStore = require('configstore');

const pkg = require('../package.json');

const config = new configStore(pkg.name, {});

Number.prototype.formatCurrency = function() {
  let value = this;
  let formmatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
  let res = formmatter.format(value);
  return res;
};

const constants = {
  USER_INFO_KEY: 'userInfo',
  NAME_KEY: 'name',
  BIWEEKLYSALARY_KEY: 'biweeklySalary',
  CATEGORY_KEY: 'categories',
  ALLOCATED_KEY: 'allocated_money',
  TOTAL_BALANCE_KEY: 'total_budget_balance',
  ADD_CATEGORY: 'Category',
  ADD_ENTRY: 'Entry'
};

//Auxiliary functions
function constructKey(...keys) {
  return keys.join('.');
}

function sumOfArray(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function keyPathToEntry(category, entry) {
  return constructKey(constants.CATEGORY_KEY, category, entry);
}
///Getter Functions
function biweeklySalary() {
  return config.get(
    constructKey(constants.USER_INFO_KEY, constants.BIWEEKLYSALARY_KEY)
  );
}

function totalBalance() {
  return config.get(
    constructKey(constants.USER_INFO_KEY, constants.TOTAL_BALANCE_KEY)
  );
}

function categories() {
  return config.get(constants.CATEGORY_KEY);
}

function allocatedMoney() {
  let res = 0;
  let c = categories();
  _.forIn(c, (value, key) => {
    _.map(value, entry => {
      res += entry.allocation;
    });
  });
  return res;
}

function totalEntryBalance() {
  let res = 0;
  let c = categories();
  _.forIn(c, (value, key) => {
    _.map(value, entry => {
      res += entry.balance;
    });
  });
  return res;
}

function entriesOf(category) {
  return config.get(constructKey(constants.CATEGORY_KEY, category));
}

function unAllocatedMoney() {
  return Number(biweeklySalary() - allocatedMoney());
}

function totalunAllocatedMoney() {
  return Number(totalBalance() - totalEntryBalance());
}

function getEntryBalance(category, entry) {
  return entriesOf(category)[entry].balance;
}

function getEntryAllocation(category, entry) {
  return entriesOf(category)[entry].allocation;
}
/////////////
///Action Functions
/////////////
function initializeData(data) {
  clearAll();

  let categories = Array.isArray(data.categories)
    ? data.categories
    : data.categories.split(' ');

  config.set(
    constructKey(constants.USER_INFO_KEY, constants.NAME_KEY),
    data.username
  );
  config.set(
    constructKey(constants.USER_INFO_KEY, constants.BIWEEKLYSALARY_KEY),
    data.biWeeklySalary
  );
  config.set(
    constructKey(constants.USER_INFO_KEY, constants.TOTAL_BALANCE_KEY),
    0
  );

  for (category of categories) {
    config.set(constructKey(constants.CATEGORY_KEY, category), {});
  }

  console.log(config.all);
}

function addEntry(data) {
  let category = data.category;
  let entryName = data.entryName;
  let entryValue = data.entryValue;

  config.set(constructKey(constants.CATEGORY_KEY, category, entryName), {
    allocation: entryValue,
    balance: 0
  });
}

function addCategory(info) {
  let categoryName = info.categoryName;
  config.set(constructKey(constants.CATEGORY_KEY, categoryName), {});
  console.log(config.all);
}

function payYourself(reversed) {
  let prevBalance = totalBalance();
  config.set(
    constructKey(constants.USER_INFO_KEY, constants.TOTAL_BALANCE_KEY),
    reversed ? prevBalance - biweeklySalary() : prevBalance + biweeklySalary()
  );
  _.forIn(categories(), (value, key) => {
    let currCategory = key;
    _.forIn(value, (value, key) => {
      let currBalance = value.balance;
      config.set(
        constructKey(constants.CATEGORY_KEY, currCategory, key, 'balance'),
        reversed
          ? currBalance - value.allocation
          : currBalance + value.allocation
      );
    });
  });

  console.log('You have been paid!');
}

function spendMoney(category, entry, amount) {
  let oldEntryValue = getEntryBalance(category, entry);
  let oldTotalBalanceValue = totalBalance();

  config.set(
    constructKey(keyPathToEntry(category, entry), 'balance'),
    oldEntryValue - amount
  );
  config.set(
    constructKey(constants.USER_INFO_KEY, constants.TOTAL_BALANCE_KEY),
    oldTotalBalanceValue - amount
  );
  console.log('You have spent', amount);
}

function allocateToEntry(category, entry, amount) {
  let oldEntryValue = getEntryBalance(category, entry);

  config.set(
    constructKey(keyPathToEntry(category, entry), 'balance'),
    oldEntryValue + amount
  );
  
  console.log('You have allocated to', entry);
}

function clearAll() {
  config.all = {};
}

module.exports = {
  initData: initializeData,
  addEntry: addEntry,
  addCategory: addCategory,
  constants: constants,
  getCategories: _.keys(categories()),
  getAllData: categories,
  getBiweeklySalary: biweeklySalary,
  getTotalBalance: totalBalance,
  getAllocatedMoney: allocatedMoney,
  getUnallocatedMoney: unAllocatedMoney,
  getTotalUnallocatedMoney: totalunAllocatedMoney,
  getTotalEntryBalance: totalEntryBalance,
  getEntriesOf: entriesOf,
  pay: payYourself,
  spend: spendMoney,
  allocateToEntry: allocateToEntry
};
