
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
