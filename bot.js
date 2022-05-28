// Debug flag

const debug = false

// Twitter library
const Twit = require('twit')
const Queue = require("bee-queue");
const { curly } = require('node-libcurl');
const svg2png = require("svg2png");
require("dotenv").config()

// We need to include our configuration file

const queue = new Queue('TWITTER', {
  removeOnSuccess: true,
  removeOnFailure: true,
});

//Check config file is filled.
const config = require('./config.js')
if (config.consumer_key == 'blah' ||
  config.consumer_secret == 'blah' ||
  config.access_token == 'blah' ||
  config.access_token_secret == 'blah') {

  console.log("You must fill your configuration file which is located /config.js");
  return;
}

const T = new Twit(require('./config.js'))

// queue.process(1, async job => {
//   const item = job.data;
//   console.log(`Processing ${item.name}...`)
//   let resp;
//   if (typeof item === 'string') {
//     return await T.post('statuses/update', { status: item });
//   }

//   let mediaIdStr;
//   if (item.pic) {
//     let { data: buffer, headers } = await curly.get(item.pic);
//     const contentType = headers.find(h => h["content-type"])
//     if (false) {
//       buffer = await svg2png(buffer)
//     }
//     if (buffer) {
//       const { item: { media_id_string } } = await T.post('media/upload', { media_item: buffer });
//       mediaIdStr = media_id_string
//       var altText = item.name + " - ENS3.org"
//       var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
//       const { item } = await T.post('media/metaitem/create', meta_params);
//       console.log({ item })
//     }
//   }

//   const status = formatTemplate(process.env.TWITTER_TEMPLATE, item);
//   console.log(status)
//   resp = await T.post('statuses/update', {
//     status,
//     media_ids: mediaIdStr ?? [mediaIdStr],
//   });

//   console.log({ item, resp })
// })

function formatTemplate(template, vars) {
  return new Function("return `" + template + "`;").call(vars);
}

console.log("Twitter bot is running...")

// A user stream
// const stream = T.stream('statuses/filter', { track: '@ens3org' });
// When someone follows the user
// stream.on('follow', followed)
// stream.on('tweet', tweetEvent)

// In this callback we can see the name and screen name
// function followed(event) {
//   const name = event.source.name
//   const screenName = event.source.screen_name
//   // const response = 'Thanks for following me, ' + name + ' @' + screenName
//   // // Post that tweet!
//   // T.post('statuses/update', { status: response }, tweeted)

//   console.log('I was followed by: ' + name + ' @' + screenName)
// }

// Here a tweet event is triggered!
// function tweetEvent(tweet) {
//   // If we wanted to write a file out
//   // to look more closely at the item
//   // const fs = require('fs')
//   // const json = JSON.stringify(tweet,null,2)
//   // fs.writeFile("tweet.json", json, output)

//   // Who is this in reply to?
//   const reply_to = tweet.in_reply_to_screen_name
//   // Who sent the tweet?
//   const name = tweet.user.screen_name
//   // What is the text?
//   const txt = tweet.text

//   // Ok, if this was in reply to me
//   // Replace selftwitterhandle with your own twitter handle
//   console.log(reply_to, name, txt)
//   if (reply_to === 'selftwitterhandle') {

//     // Get rid of the @ mention
//     txt = txt.replace(/@selftwitterhandle/g, '')

//     // Start a reply back to the sender
//     const reply = 'Hi @' + name + ' ' + ', Thanks for the mention :)'

//     console.log(reply)
//     // Post that tweet!
//     T.post('statuses/update', { status: reply }, tweeted)
//   }
// }

// This function finds the latest tweet with the #hashtag, and retweets it.
// This is the URL of a search for the latest tweets on the #hashtag.
// const hastagSearch = { q: '#ens', count: 10, result_type: 'recent' }

// function retweetLatest() {
//   T.get('search/tweets', hastagSearch, function (error, item) {
//     if (error)
//       return console.error(error)

//     console.log({ item })
//     const tweets = item.statuses
//     for (const i = 0; i < tweets.length; i++) {
//       console.log(tweets[i])
//     }
//     // If our search request to the server had no errors...
//     if (!error) {
//       // ...then we grab the ID of the tweet we want to retweet...
//       const retweetId = item.statuses
//         .sort((a, b) => b.user.followers_count - a.user.followers_count)[0]
//         .id_str
//       // ...and then we tell Twitter we want to retweet it!
//       T.post('statuses/retweet/' + retweetId, {}, tweeted)
//     }
//     // However, if our original search request had an error, we want to print it out here.
//     else {
//       if (debug) {
//         console.log('There was an error with your hashtag search:', error)
//       }
//     }
//   })
// }

// Make sure it worked!
// function tweeted(err, reply) {
//   if (err !== undefined) {
//     console.log(err)
//   } else {
//     console.log('Tweeted: ' + reply)
//   }
// }

// // Try to retweet something as soon as we run the program...
// retweetLatest()
// // ...and then every hour after that. Time here is in milliseconds, so
// // 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
// setInterval(retweetLatest, 1000 * 60 * 12)

async function t() {
  let { data: buffer, headers } = await curly.get("https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0xd7ba72eebb847f83156b72cf82aea78252af96f12263ec4a864fa502bc743e90/image");
  const contentType = (headers[1]['content-type']);
  if (contentType.includes("svg")) {
    console.log(buffer)
    buffer = await svg2png(buffer)
  }


  console.log(buffer)
}

t();