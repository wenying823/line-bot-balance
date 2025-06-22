require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const { getBalance, updateBalance, addRecord, getRecords } = require('./db');

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.status(200).json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const msg = event.message.text.trim();

  return new Promise((resolve) => {
    getBalance((currentBalance) => {
      if (/^存款\s*\d+$/.test(msg)) {
        const add = parseInt(msg.match(/\d+/)[0]);
        const newBalance = currentBalance + add;
        updateBalance(newBalance, () => {
          addRecord('存款', add, '', () => {
            const flex = generateBalanceFlex(newBalance);
            resolve(replyFlex(event, flex, `已存款 ${add} 元，目前餘額 ${newBalance} 元`));
          });
        });

      } else if (/^(\D+)\s*(\d+)$/.test(msg)) { 
        const item = msg.match(/^(\D+)\s*(\d+)$/);
        const name = item[1].trim();
        const cost = parseInt(item[2]);
        const newBalance = currentBalance - cost;
        updateBalance(newBalance, () => {
            addRecord(name, -cost, '', () => {
            const flex = generateBalanceFlex(newBalance);
            resolve(replyFlex(event, flex, `已記錄支出 ${name} ${cost} 元，目前餘額 ${newBalance} 元`));
            });
        });


      } else if (msg === '查餘額') {
        const flex = generateBalanceFlex(currentBalance);
        resolve(replyFlex(event, flex, '目前餘額'));

      } else if (msg === '明細') {
        getRecords((records) => {
          const flex = generateRecordFlex(records);
          resolve(replyFlex(event, flex, '記帳明細'));
        });

      } else {
        resolve(client.replyMessage(event.replyToken, {
          type: 'text',
          text: '請輸入「存款 數字」、「品項 金額」，或「查餘額」、「明細」'
        }));
      }
    });
  });
}

function replyFlex(event, contents, altText) {
  return client.replyMessage(event.replyToken, {
    type: 'flex',
    altText,
    contents
  });
}

function generateBalanceFlex(amount) {
  return {
    type: "bubble",
    size: "nano",
    body: {
      type: "box",
      layout: "vertical",  // 水平排列
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "目前餘額",
          weight: "bold",
          size: "md",
          align: "center",
          flex: 1,
          wrap: true
        },
        {
          type: "text",
          text: `${amount} 元`,
          weight: "bold",
          size: "xl",
          color: "#1DB446",
          align: "center",
          flex: 1,
          wrap: true
        },
        {
          type: "text",
          text: "我愛葉竹芸！",
          size: "xs",
          color: "#aaaaaa",
          align: "center",
          flex: 1,
          wrap: true
        },
      ]
    }
  };
}

function generateRecordFlex(records) {
  const contents = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "項目", weight: "bold", size: "sm", flex: 1, align: "start" },
        { type: "text", text: "金額", weight: "bold", size: "sm", flex: 1, align: "start" },
        { type: "text", text: "日期", weight: "bold", size: "sm", flex: 1, align: "start" }
      ]
    }
  ];

  records.forEach(r => {
    const date = new Date(r.created_at).toLocaleDateString();
    contents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: r.name, size: "sm", flex: 1, align: "start" },
        {
          type: "text",
          text: `${r.amount > 0 ? '+' : ''}${r.amount}元`,
          size: "sm",
          flex: 1,
          align: "start",
          color: r.amount > 0 ? "#1DB446" : "#FF0000"
        },
        { type: "text", text: date, size: "sm", flex: 1, align: "start" }
      ]
    });
  });

  return {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        { type: "text", text: "記帳明細", weight: "bold", size: "lg", align: "start" }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: contents
    }
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`機器人已啟動於 PORT ${PORT}`);
});
