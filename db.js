const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  // 餘額表
  db.run(`
    CREATE TABLE IF NOT EXISTS balance (
      id INTEGER PRIMARY KEY,
      amount INTEGER
    )
  `);

  // 初始化餘額
  db.get(`SELECT * FROM balance WHERE id = 1`, (err, row) => {
    if (!row) {
      db.run(`INSERT INTO balance (id, amount) VALUES (1, 0)`);
    }
  });

  // 記帳明細表
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      amount INTEGER,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// 讀餘額
function getBalance(callback) {
  db.get(`SELECT amount FROM balance WHERE id = 1`, (err, row) => {
    if (err) {
      console.error('查詢餘額失敗', err);
      callback(0);
    } else {
      callback(row ? row.amount : 0);
    }
  });
}

// 更新餘額
function updateBalance(amount, callback) {
  db.run(`UPDATE balance SET amount = ? WHERE id = 1`, [amount], (err) => {
    if (err) console.error('更新餘額失敗', err);
    callback && callback();
  });
}

// 新增記帳明細
function addRecord(name, amount, note = '', callback) {
  db.run(`INSERT INTO items (name, amount, note) VALUES (?, ?, ?)`, [name, amount, note], (err) => {
    if (err) console.error('新增記帳明細失敗', err);
    callback && callback();
  });
}

// 取得最新10筆明細，倒序
function getRecords(callback) {
  db.all(`SELECT * FROM items ORDER BY created_at DESC LIMIT 10`, (err, rows) => {
    if (err) {
      console.error('查詢記帳明細失敗', err);
      callback([]);
    } else {
      callback(rows);
    }
  });
}

module.exports = { getBalance, updateBalance, addRecord, getRecords };
