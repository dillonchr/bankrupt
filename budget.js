const async = require("async");
const db = require("@dillonchr/ephemeraldb");

const COLLECTION_NAME = process.env.BANKRUPT_BUDGET_COLLECTION;
const BASE_BUDGET =
  process.env.BANKRUPT_BUDGET_CUT / process.env.BANKRUPT_BUDGET_USERCOUNT;

const onBalanceResponse = callback => (err, user) => {
  if (!user && !err) {
    err = new Error("no budget found for requested id");
  }
  if (err) {
    callback(err);
  } else {
    callback(
      null,
      user.transactions.reduce((s, c) => s - c.price, BASE_BUDGET)
    );
  }
};

const getSearch = id => {
  return { $or: [{ phone: id }, { slack: id }, { _id: id }] };
};

module.exports = {
  balance(id, onResponse) {
    db.findItemInCollection(
      COLLECTION_NAME,
      getSearch(id),
      onBalanceResponse(onResponse)
    );
  },
  spend(id, description, amount, onResponse) {
    db.findItemInCollection(COLLECTION_NAME, getSearch(id), (err, data) => {
      if (!data && !err) {
        err = new Error(`no budget found for requested id ${id}`);
      }
      if (err) {
        onResponse(err);
      } else {
        data.transactions.push({ description, price: amount });
        db.replaceDocument(COLLECTION_NAME, getSearch(id), data, err => {
          onBalanceResponse(onResponse)(err, data);
        });
      }
    });
  },
  reset(leftovers, onResponse) {
    db.getAllDocumentsInCollection(COLLECTION_NAME, (err, docs) => {
      if (err) {
        onResponse(err);
      } else {
        const resetDocs = docs.map(user => {
          const balance = user.transactions.reduce(
            (s, c) => s - c.price,
            BASE_BUDGET
          );
          const transactions = [];

          function addCredit(description, amt) {
            if (amt > 0) {
              transactions.push({ description, price: amt * -1 });
            }
          }

          addCredit("Rollover", balance);
          addCredit("Leftovers", leftovers);

          return { ...user, transactions };
        });

        async.series(
          resetDocs.map(doc => {
            return fn =>
              db.replaceDocument(COLLECTION_NAME, { _id: doc._id }, doc, fn);
          }),
          onResponse
        );
      }
    });
  }
};
