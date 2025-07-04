// 初始化資料表與預設餘額
const { sequelize, getBalanceModel, getItemModel } = require('./services/modelLoader');

async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('DB connected!');
    await getBalanceModel().sync();
    await getItemModel().sync();
    console.log('Tables synced!');
    // 初始化餘額
    const exist = await getBalanceModel().findByPk(1);
    if (!exist) {
      await getBalanceModel().create({ id: 1, amount: 0 });
      console.log('Initial balance created!');
    }
  } catch (err) {
    console.error('DB init error:', err);
  }
}
initDB();

// 只匯出 model 與 sequelize，邏輯請用 service
module.exports = {
  sequelize,
  Balance: getBalanceModel(),
  Item: getItemModel(),
};
