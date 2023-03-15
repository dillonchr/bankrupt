const path = require("path");
const fs = require("fs/promises");

const { BANKRUPT_DIRNAME: BankruptDir } = process.env;
const RegisterPath = path.join(BankruptDir, "register.json");

let timerId = -1;

async function save(data) {
  if (0 < timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(async () => {
    try {
      await fs.writeFile(RegisterPath, JSON.stringify(data));
    } catch (err) {
      console.error(`Couldn't save file ${RegisterPath}!`);
    } finally {
      timerId = -1;
    }
  }, 60000);
}

async function read() {
  try {
    return JSON.parse(await fs.readFile(RegisterPath, { encoding: "utf8" }));
  } catch (err) {
    console.error(`Couldn't read file ${RegisterPath}!`);
    return {};
  }
}

module.exports = {
  read,
  save,
};
