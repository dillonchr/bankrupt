# Bankrupt
A paycheck and budget balancer

## Instal
`npm i @dillonchr/bankrupt`

## Overview
This module is built to keep track of how much your paycheck was. What you're spending out of it. How much you allocate for your personal budget. And how much of your personal budget you've spent. When you get paid again you can reset your paycheck and keep the budget leftovers in your next budget. If you create a budget deficit, then that's on you. I don't track those because I like buying stuff.

## Usage
You have several `env` variables to configure before you can use this module. Including the [ephemeraldb ones](https://github.com/dillonchr/ephemeraldb).
 * `BANKRUPT_PAYCHECK_COLLECTION` - mongo collection name for paycheck transaction records
 * `BANKRUPT_BUDGET_COLLECTION` - mongo collection for budget users and their transactions
 * `BANKRUPT_BUDGET_CUT` - how much of each paycheck is cut out of each paycheck (in dollars)
 * `BANKRUPT_BUDGET_USERCOUNT` - how many people get a cut of the budget's cut

 ## Paycheck submodule
 You can get `balance`, `spend`, and `reset` on paycheck.

 ## Budget submodule
 You can get `balance`, `spend`, and `reset`. I wouldn't advise resetting manually though because paycheck hooks into budget to keep their transaction histories in sync. And balance and spend require user IDs. I use discord's user ID to find my records because discord is what my bot runs on that actually updates my budgets and paychecks.
 