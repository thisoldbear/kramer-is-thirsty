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

const searchTweets = (q) => {
  Twitter.get('search/tweets', {
      q,
      count: 30
    }, (err, data, response) => {

      /// Filter statuses with media object
      const statuses = data.statuses.filter(status => {
        if (status.entities.media) {
          return true;
        }
      });

      for (status of statuses) {
        console.log(status.entities.media[0].media_url);
      }
  });
};

searchTweets('#pretzel filter:images');
