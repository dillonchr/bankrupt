const { read, save } = require("./persist.js");
const { BANKRUPT_BUDGET_CUT: BudgetCut, BANKRUPT_DEFAULT_PAYCHECK_AMOUNT: DefaultPaycheckAmt } = process.env;

// this is the in-memory paycheck and budget information
let register = {};

async function onInit() {
  register = await read("register.json");
}

function balance(id) {
  if (null != id && !(id in register)) {
    register[id] = 0.0;
  }
  return register[id];
}

function spend(id, amount, onResponse) {
  if (null != id && id in register) {
    register[id] = register[id] - amount;
    save("register.json", register);
    return register[id];
  }
}

function reset(id, amount = DefaultPaycheckAmt, onResponse) {
  const linkedBudgetIds = register[`linked-budgets-${id}`];
  if (null != linkedBudgetIds) {
    const prevBalance = register[id];
    const splitBalance = prevBalance > 0 ? prevBalance * 0.1 : 0;
    for (const budgetId of linkedBudgetIds) {
      reset(budgetId, Math.max(register[budgetId], 0.0) + splitBalance);
    }
  }
  register[id] = amount;
  return balance(id);
}

module.exports = {
  balance,
  spend,
  reset,
  init: onInit,
};
