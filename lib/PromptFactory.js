const qs = require('./Questions');
const dataManager = require('./Data');

function streamPush(qArray, ...questions) {
  for (question of questions) {
    qArray.push(question);
  }
}

//Init
function generateInitQuestions() {
  const questions = [];
  streamPush(questions, qs.usernameQ(), qs.biweeklySalaryQ(), qs.categoriesQ());
  return questions;
}

//Add
function generateAddQuestions() {
  const questions = [];
  const ifEntry = function(hash) {
    if (hash.addChoice === dataManager.constants.ADD_ENTRY) {
      return true;
    }
    return false;
  };
  const ifCategory = function(hash) {
    if (hash.addChoice === dataManager.constants.ADD_CATEGORY) {
      return true;
    }
    return false;
  };

  streamPush(
    questions,
    qs.categoriesOrEntriesQ(),
    qs.nameOfCategoryQ(ifCategory),
    qs.whichCategoryQ(ifEntry),
    qs.nameOfEntryQ(ifEntry),
    qs.entryAllocationQ(ifEntry)
  );
  return questions;
}

//View
function generateViewQuestions() {
  let questions = [];
  questions.push(qs.viewTypeQ());
  return questions;
}

//spend
function generateSpendQuestions() {
  let questions = [];
  streamPush(
    questions,
    qs.whichCategoryQ(),
    qs.whichEntryQ(),
    qs.howMuchSpentQ(function(hash) {
      if (hash.entry === 'none') {
        return false;
      } else {
        return true;
      }
    })
  );
  return questions;
}

//allocate
function generateAllocateQuestions() {
  let questions = [];

  streamPush(
    questions,
    qs.howMuchSpentQ(null, function(value) {
      let totalUnallocatedMoney = dataManager.getTotalUnallocatedMoney();
      if (totalUnallocatedMoney - Number(value) < 0) {
        return (
          'You only have ' +
          Number(totalUnallocatedMoney).formatCurrency() +
          ' left to allocate'
        );
      }
      return null;
    }),
    qs.whichCategoryQ(),
    qs.whichEntryQ()
  );
  return questions;
}

module.exports = {
  generateInitQuestions: generateInitQuestions,
  generateAddQuestions: generateAddQuestions,
  generateViewQuestions: generateViewQuestions,
  generateSpendQuestions: generateSpendQuestions,
  generateAllocateQuestions: generateAllocateQuestions
};
