'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const request = require('request');
const fs = require('fs');

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

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
  // if (event.type !== 'message' || event.message.type !== 'text') {
  //   // ignore non-text-message event
  //   return Promise.resolve(null);
  // }
  var ret_data = getCalMamData('./test.jpg');
  var ret_text = ret_data.length + '個の要素を検出しました!\n';
  ret_text += 'これは' + ret_data[0]['group'] + 'ですか？';

  // create a echoing text message
  const echo = { type: 'text', text:ret_text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

function getCalMamData(data_url) {
  var url = 'https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=' + process.env.MAM_KEY;
  var formData = {
    'media': fs.createReadStream(data_url)
  };
  request.post({url:url, formData:formData}, function(err, rew, body) {
    if(err) {
      console.log(err);
    } else {
      var get_data = JSON.parse(body);
      return get_data['results'];
    }
  });
}


// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
