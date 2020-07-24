const async = require("async");
const db = require("@dillonchr/ephemeraldb");
const budget = require("./budget.js");

const COLLECTION_NAME = process.env.BANKRUPT_PAYCHECK_COLLECTION;

function extractRemainingBalanceFromPaycheck(paycheck) {
  let diff = paycheck.balance - process.env.BANKRUPT_BUDGET_CUT;
  for (const amt of paycheck.transactions) {
    diff -= amt;
  }
  return diff;
}

function getBalance(onResponse) {
  db.findItemInCollection(COLLECTION_NAME, {}, (err, paycheck) => {
    if (err) {
      onResponse(err);
    } else {
      onResponse(null, extractRemainingBalanceFromPaycheck(paycheck));
    }
  });
}

module.exports = {
  balance(onResponse) {
    getBalance(onResponse);
  },
  spend(amount, onResponse) {
    db.findItemInCollection(COLLECTION_NAME, {}, (err, paycheck) => {
      if (err) {
        onResponse(err);
      } else {
        paycheck.transactions.push(amount);
        db.replaceDocument(COLLECTION_NAME, {}, paycheck, err => {
          if (err) {
            onResponse(err);
          } else {
            onResponse(null, extractRemainingBalanceFromPaycheck(paycheck));
          }
        });
      }
    });
  },
  reset(amount = process.env.BANKRUPT_DEFAULT_PAYCHECK_AMOUNT, onResponse) {
    const paycheck = {
      balance: amount,
      transactions: []
    };

    getBalance(function (err, balance) {
      if (err) {
        onResponse(err);
      } else {
        const splitBalance = balance > 0 ? balance * 0.1 : 0;
        async.series(
          [
            fn => db.replaceDocument(COLLECTION_NAME, {}, paycheck, fn),
            fn => budget.reset(splitBalance, fn)
          ],
          err => {
            if (err) {
              onResponse(err);
            } else {
              onResponse(null, extractRemainingBalanceFromPaycheck(paycheck));
            }
          }
        );
      }
    });
  }
};
