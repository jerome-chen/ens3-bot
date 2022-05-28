const getEnv = (key) => {
  const env = (process.env.NODE_ENV || "development").toUpperCase();
  console.log(`${env}_${key}`)
  return process.env[`${env}_${key}`] || process.env[`${key}`]
}

// Put your own Twitter App keys here. See README.md for more detail.
module.exports = {
  consumer_key: getEnv('CONSUMER_KEY') || 'blah',
  consumer_secret: getEnv('CONSUMER_SECRET') || 'blah',
  access_token: getEnv('ACCESS_TOKEN') || 'blah',
  access_token_secret: getEnv('ACCESS_TOKEN_SECRET') || 'blah',
  bearer_token: getEnv('BEAR_TOKEN') || 'blah'
}
