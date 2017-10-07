'use strict';

const request = require('request');
const fs = require('fs');

exports.getCalMamData = (data_url, callback) => {
  var url = 'https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=' + process.env.MAM_KEY;
  var formData = {
    'media': fs.createReadStream(data_url)
  };
  request.post({url:url, formData:formData}, function(err, rew, body) {
    if(err) {
      console.log(err);
    } else {
      var get_data = JSON.parse(body);
      console.log(get_data);
      var ret_text = get_data.length + '個の要素を検出しました!\n';
      ret_text += 'これは' + get_data.results[0]['group'] + 'ですか？';
      callback(get_data['results']);
    }
  });
}