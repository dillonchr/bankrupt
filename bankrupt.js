const { read, save } = require("./persist.js");
const { BANKRUPT_DEFAULT_PAYCHECK_AMOUNT } = process.env;
const DefaultPaycheckAmt = BANKRUPT_DEFAULT_PAYCHECK_AMOUNT || 1000;

// this is the in-memory paycheck and budget information
let register = {};

async function onInit() {
  register = await read();
}

function balance(id) {
  if (null != id && !(id in register)) {
    register[id] = 0.0;
  }
  return register[id];
}

function spend(id, amount) {
  if (null != id) {
    register[id] = balance(id) - amount;
    save(register);
    return register[id];
  }
}

function reset(id, amount = DefaultPaycheckAmt) {
  const linkedBudgetConfig = register[`linked-budget-${id}`];
  if (null != linkedBudgetConfig) {
    const { ids, cut } = linkedBudgetConfig;
    const prevBalance = register[id];
    const splitBalance = prevBalance > 0 ? prevBalance * 0.1 : 0;
    const beginningBal = splitBalance + cut / ids.length;
    for (const budgetId of ids) {
      reset(budgetId, Math.max(balance(budgetId), 0.0) + beginningBal);
    }
    amount -= cut;
  }
  register[id] = amount;
  save(register);
  return balance(id);
}

module.exports = {
  balance,
  spend,
  reset,
  init: onInit
};
