const { getItemModel } = require('./modelLoader');

// 新增記帳明細
async function addRecord(name, amount, note = '') {
  const Item = getItemModel();
  await Item.create({ name, amount, note });
}

// 取得最新10筆明細，倒序
async function getRecords() {
  const Item = getItemModel();
  return await Item.findAll({
    order: [['created_at', 'DESC']],
    limit: 10,
  });
}

module.exports = { addRecord, getRecords };
