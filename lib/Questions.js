const dataManager = require('./Data');

const _ = require('lodash');

function generateQuestionsObj(
  name,
  message,
  validate = null,
  filter = null,
  transformer = null,
  defaultvalue = null,
  choices = null,
  when = null,
  type = 'input'
) {
  let result = {};
  result['name'] = name;
  result['message'] = message;
  result['type'] = type;
  validate && (result['validate'] = validate);
  filter && (result['filter'] = filter);
  transformer && (result['transformer'] = transformer);
  choices && (result['choices'] = choices);
  defaultvalue && (result['default'] = defaultvalue);
  when && (result['when'] = when);
  return result;
}

module.exports = {
  usernameQ: (when = () => true) => {
    return generateQuestionsObj(
      'username',
      'Enter your name: ',
      function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your name.';
        }
      },
      null,
      null,
      null,
      null,
      when
    );
  },
  biweeklySalaryQ: (when = () => true) => {
    return generateQuestionsObj(
      'biWeeklySalary',
      'Enter your bi-weekly salary after taxes: ',
      function(value) {
        if (Number(value)) {
          return true;
        } else {
          return 'Please enter a valid number';
        }
      },
      function(value) {
        return Number(value);
      },
      function(value) {
        if (Number(value)) {
          return Number(value).formatCurrency();
        }
        return value;
      },
      null,
      null,
      when
    );
  },
  categoriesQ: (when = () => true) => {
    return generateQuestionsObj(
      'categories',
      'Enter your budget categories (separate by spaces): ',
      null,
      null,
      null,
      ['Expenses', 'Savings'],
      null,
      when
    );
  },
  categoriesOrEntriesQ: (when = () => true) => {
    return generateQuestionsObj(
      'addChoice',
      'What do you want to add?',
      null,
      null,
      null,
      null,
      [dataManager.constants.ADD_ENTRY, dataManager.constants.ADD_CATEGORY],
      when,
      'list'
    );
  },
  whichCategoryQ: (when = () => true) => {
    return generateQuestionsObj(
      'category',
      'Which category?',
      null,
      null,
      null,
      null,
      dataManager.getCategories,
      when,
      'list'
    );
  },
  whichEntryQ: (when = () => true) => {
    return generateQuestionsObj(
      'entry',
      'Which entry?',
      null,
      function(answer) {
        if (answer === 'No entries -> exit') {
          return 'none';
        } else {
          return answer;
        }
      },
      null,
      null,
      function(hash) {
        const entries = dataManager.getEntriesOf(hash.category);
        if (_.isEmpty(entries)) {
          return ['No entries -> exit'];
        }
        return _.keys(entries);
      },
      when,
      'list'
    );
  },
  nameOfCategoryQ: (when = () => true) => {
    return generateQuestionsObj(
      'categoryName',
      'What is the name of the category?',
      null,
      null,
      null,
      function() {
        return 'Category' + String(dataManager.getCategories.length + 1);
      },
      null,
      when
    );
  },
  nameOfEntryQ: (when = () => true) => {
    return generateQuestionsObj(
      'entryName',
      'What is the name of the entry?',
      null,
      null,
      null,
      function(hash) {
        return (
          'Entry' +
          String(_.keys(dataManager.getEntriesOf(hash.category)).length + 1)
        );
      },
      null,
      when
    );
  },
  entryAllocationQ: (when = () => true) => {
    return generateQuestionsObj(
      'entryValue',
      'How much should be allocated to this entry? ',
      function(value) {
        let allocated = dataManager.getAllocatedMoney();
        let salary = dataManager.getBiweeklySalary();
        let errors = {
          numError: 'Please enter a valid number',
          allocatedError:
            'You only have ' +
            dataManager.getUnallocatedMoney().formatCurrency() +
            ' left to allocate'
        };

        if (Number(value)) {
          if (allocated + Number(value) > salary) {
            return errors.allocatedError;
          }
          return true;
        } else {
          return errors.numError;
        }
      },
      function(value) {
        return Number(value);
      },
      function(value) {
        if (Number(value)) {
          return Number(value).formatCurrency();
        }
        return value;
      },
      null,
      null,
      when
    );
  },
  viewTypeQ: (when = () => true) => {
    let categories = dataManager.getCategories;
    return generateQuestionsObj(
      'viewType',
      'What would you like to view?',
      null,
      null,
      null,
      null,
      _.concat(categories, ['Total Balance', 'Allocated']),
      when,
      'list'
    );
  },
  howMuchSpentQ: (when = () => true, validate = null) => {
    return generateQuestionsObj(
      'amount',
      'How much? ',
      function(value) {
        if (validate) {
          let check = validate(value);
          if (check) {
            return check;
          }
        }

        if (Number(value)) {
          return true;
        } else {
          return 'Please enter a valid number';
        }
      },
      function(value) {
        return Number(value);
      },
      function(value) {
        if (Number(value)) {
          return Number(value).formatCurrency();
        }
        return value;
      },
      null,
      null,
      when
    );
  }
};
