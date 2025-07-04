const express = require('express');
const router = express.Router();
const line = require('@line/bot-sdk');
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

const { handleEvent } = require('../controllers/webhookController');

router.post('/', line.middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(req.body.events.map(event => handleEvent(event, client)));
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

module.exports = router;
