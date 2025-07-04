require('dotenv').config();
require('./db');
const express = require('express');
const app = express();

// 掛載 webhook 路由
app.use('/webhook', require('./routes/webhook'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`機器人已啟動於 PORT ${PORT}`);
});
