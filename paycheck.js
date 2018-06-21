const async = require('async');
const db = require('@dillonchr/ephemeraldb');
const budget = require('./budget.js');

const COLLECTION_NAME = process.env.BANKRUPT_PAYCHECK_COLLECTION;

const extractRemainingBalanceFromPaycheck = (paycheck) => {
    return paycheck.transactions.reduce((sum, deduction) => sum - deduction, paycheck.balance - process.env.BANKRUPT_BUDGET_CUT);
};

module.exports = {
    balance(onResponse) {
        db.findItemInCollection(COLLECTION_NAME, {}, (err, paycheck) => {
            if (err) {
                onResponse(err);
            } else {
                onResponse(null, extractRemainingBalanceFromPaycheck(paycheck));
            }
        });
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

        async.series([
            fn => db.replaceDocument(COLLECTION_NAME, {}, paycheck, fn),
            fn => budget.reset(fn)
        ], err => {
            if (err) {
                onResponse(err);
            } else {
                onResponse(null, extractRemainingBalanceFromPaycheck(paycheck));
            }
        });
    }
};