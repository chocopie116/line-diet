'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const request = require('request');

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
  console.log("root");
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
      fs.writeFile('./tmp/image.jpg', img, 'binary', (err) => {
        let message = {type: 'text', text: ''};
        if (err) {
          message.text ='ファイルのアップロードに失敗';

          return client.replyMessage(event.replyToken, message);
        }

        getCalMamData('./tmp/image.jpg', (result) => {
          if (!result) {
            message.text = 'なんか変だよ';
            return client.replyMessage(event.replyToken, message);
          }

          // JSON.stringify(result);
          const num = result[0].items.length;
          message.text = num;
          return client.replyMessage(event.replyToken, message);
        });
      }); });
  }
}

function getCalMamData(data_url, callback) {
  var url = 'https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=' + process.env.MAM_KEY;
  var formData = {
    'media': fs.createReadStream(data_url)
  };
  request.post({url:url, formData:formData}, function(err, rew, body) {
    if(err) {
      console.log(err);
      return callback(null);
    }

    var get_data = JSON.parse(body);
    callback(get_data['results']);
  });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
