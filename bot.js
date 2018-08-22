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

const retweet = (id) => {
  Twitter.post('statuses/retweet/:id',
    { id }, (err, data, response) => {
    console.log(data);
  });
}

const detectPretzel = (status) => {
  return new Promise((resolve, reject) => {

    const mediaUrl = status.entities.media[0].media_url;

    const requestBody = {
      requests: [
        {
          image: {
            source: {
              imageUri: `${mediaUrl}:small`
            }
          },
          features: [
            {
              type: 'LABEL_DETECTION'
            }
          ]
        }
      ]
    };

    const requestOptions = {
      url: `https://vision.googleapis.com/v1/images:annotate?key=${config.vision_key}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    request(requestOptions, (err, res, body) => {
        const json = JSON.parse(body);

        const annotations = json.responses[0].labelAnnotations;

        if (annotations !== undefined && annotations.length) {
          const isPretzel = json.responses[0].labelAnnotations.filter(annotation => {
            return annotation.description === 'pretzel' && annotation.score > 0.7;
          });

          if (isPretzel.length) {
            console.log(`${status.id_str} has Pretzel`);
            retweet(status.id_str);
            resolve('has pretzel');
          } else {
            const err = new Error(`No pretzels found`)
            reject(err);
          }
        } else {
          const err = new Error(`No annotations found`)
          reject(err);
        }
    });
  });
}

const searchTweets = (q) => {
  Twitter.get('search/tweets', {
      q,
      count: 30
    }, (err, data, response) => {

      const statusesWithMedia = data.statuses.filter(status => {
        if (status.entities.media) {
          return true;
        }
      })

      Promise.all(statusesWithMedia.map(detectPretzel)).catch(err => {
        console.log(err);
      })
  });
};

searchTweets('#pretzel filter:images');
