// 統一載入 model，避免循環引用
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // <--- 這行很重要
    }
  }
});

let Balance = null;
let Item = null;

function getBalanceModel() {
  if (!Balance) {
    Balance = require(path.join('..', 'models', 'balance'))(sequelize);
  }
  return Balance;
}

function getItemModel() {
  if (!Item) {
    Item = require(path.join('..', 'models', 'item'))(sequelize);
  }
  return Item;
}

module.exports = { getBalanceModel, getItemModel, sequelize };
