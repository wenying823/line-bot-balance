const { getBalanceModel } = require('./modelLoader');

// 查詢餘額
async function getBalance() {
  const Balance = getBalanceModel();
  const row = await Balance.findByPk(1);
  return row ? row.amount : 0;
}

// 更新餘額
async function updateBalance(amount) {
  const Balance = getBalanceModel();
  await Balance.update({ amount }, { where: { id: 1 } });
}

// 增加餘額
async function increaseBalance(delta) {
  const Balance = getBalanceModel();
  const row = await Balance.findByPk(1);
  const newAmount = (row ? row.amount : 0) + delta;
  await Balance.update({ amount: newAmount }, { where: { id: 1 } });
  return newAmount;
}

// 扣減餘額
async function decreaseBalance(delta) {
  return increaseBalance(-delta);
}

module.exports = { getBalance, updateBalance, increaseBalance, decreaseBalance };
