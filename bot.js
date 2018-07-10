const request = require('request');
const twit = require('twit');

const config = require('./config.js');

const Twitter = new twit(config);

request.defaults({ encoding: null });

const updateStatus = () => {
  Twitter.post('statuses/update', {
      status: 'These pretzels are making me thirsty'
    }, (err, data, response) => {
      console.log(data);
  });
};

updateStatus();
