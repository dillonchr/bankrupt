# Bankrupt
A paycheck and budget balancer

## Instal
`npm i @dillonchr/bankrupt`

## Overview
This module is built to keep track of how much your paycheck was. What you're spending out of it. How much you allocate for your personal budget. And how much of your personal budget you've spent. When you get paid again you can reset your paycheck and keep the budget leftovers in your next budget. If you create a budget deficit, then that's on you. I don't track those because I like buying stuff.

## Environment
 * `BANKRUPT_DIRNAME` - path to store `register.json` config file
 * `BANKRUPT_DEFAULT_PAYCHECK_AMOUNT` - float - the default amount of each paycheck

## Usage
 You can get `balance`, `spend`, and `reset`.

### `balance(id)`
This will fetch the current balance for the account whose `id` matches

### `spend(id, amount)`
This will update the account whose `id` matches to have `balance - amount` as its new balance. This will write changes to disk after 60 seconds.

### `reset(id, amount=BANKRUPT_DEFAULT_PAYCHECK_AMOUNT)`
This will reset the account whose `id` matches to have a fresh balance.

This will check the register to see if there is a corresponding `linking-budget-${id}` configuration. If there is a configuration, it will be structured like this:

```json
{
  "cut": 100,
  "ids": ["0001234","0005678"],
}
```

And this will then cycle through the associated `ids` to reset their balance too. First it will check the current balance for the paycheck, the original `id`, then divide any positive number by `0.1` and give each linked budget `id` a little bonus from the leftovers. Then it takes the `cut` and divides by the number of `ids` present and sets that as the minimum balance of the budget `id`. It goes over each `id` in the array and checks if there's a positive balance and then sums the min with the current balance. Otherwise it just sets the account's balance to the minimum balance.

### Changes
Starting with 2.0.0, I wanted to get rid of `mongodb`. So this is an attempt to simplify this module and hopefully make it a little easier to work with. So this is a major release because the `paycheck` and `budget` submodules have been removed completely. Now it's best to just think of this module as a simple calculator.

The way kowalski works with this now, is it uses the `paycheck` channel ID for the `paycheck` balance/spend/reset. And it uses `author.userId` as the `budget` ID. So we can keep everything in one config file and even roll out changes via updating the config file.
