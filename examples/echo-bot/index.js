'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const easyimg = require('easyimage');
const mam = require('./mam');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

app.get('/', line.middleware(config), (req, res) => {
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.log(err);
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text' && event.message.type !== 'image') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  if (event.message.type==='text') {
      const echo = { type: 'text', text: event.message.text };
      return client.replyMessage(event.replyToken, echo);
  } else if (event.message.type==='image') {
    const messageId = event.message.id;
    const stream = client.getMessageContent(messageId);
    let data = [];
    stream.on('data', (chunk) => {
      // receive data
      data.push(new Buffer(chunk));
    });

    stream.on('error', (err) => {
      // error handling
    });

    stream.on('end', () => {
      const img = Buffer.concat(data);
      const filepath = './tmp/image.jpg';
      const dstpath = './tmp/resized.jpg';
      fs.writeFile(filepath, img, 'binary', (err) => {
        if (err) return console.log(err);
        const option = { src: filepath, dst: dstpath, width: 544, height: 544 };
        easyimg.resize( option ).then(
          ( file ) => {
            // 成功した場合の処理
            // console.log("success resize");
            mam.getCalMamData(dstpath, (result) => {
              const num = result[0].items.length;
              const echo = {type: 'text', text: num};
              return client.replyMessage(event.replyToken, echo);
            });
          },
          ( err ) => {
            console.log(err);
          }
        );
      });
    });
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});