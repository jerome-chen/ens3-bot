// Debug flag

const debug = false

// Twitter library
const Twit = require('twit')
const Queue = require("bee-queue");
const fs = require("fs");
const { curly } = require('node-libcurl');
const { initialize, svg2png } = require('svg2png-wasm');
require("dotenv").config()

// We need to include our configuration file

initialize(
  fs.readFileSync('./node_modules/svg2png-wasm/svg2png_wasm_bg.wasm'),
);

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

const TIMEOUT = 60 * 60 * 1000; // 60 minutes
queue.process(1, async job => {
  if (Date.now() >= (job.data.created_date || job.options.timestamp) + TIMEOUT) {
    throw new Error('job timed out');
  }
  const item = job.data;
  console.log(`Processing ${item.name}...`)
  let resp;
  if (typeof item === 'string') {
    return await T.post('statuses/update', { status: item });
  }

  let mediaIdStr;
  if (item.pic) {
    let { data: buffer, headers } = await curly.get(item.pic);
    console.log("Pic downloaded");
    buffer = await toPNG({ buffer, headers })
    if (buffer) {
      const { item: { media_id_string } } = await T.post('media/upload', { media_item: buffer });
      mediaIdStr = media_id_string
      console.log(`Media uploaded to Twitter with ID: ${mediaIdStr}`)
      var altText = item.name + " - ENS3.org"
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
      const { item } = await T.post('media/metadata/create', meta_params);
      console.log(`Meta created as: ${item}`)
    }
  }

  const status = formatTemplate(process.env.TWITTER_TEMPLATE, item);
  console.log(`Twitter is ready: ${status}`)
  resp = await T.post('statuses/update', {
    status,
    media_ids: mediaIdStr ?? [mediaIdStr],
  });

  console.log({ item, resp })
})

function formatTemplate(template, vars) {
  return new Function("return `" + template + "`;").call(vars);
}

console.log("Twitter bot is running...")

const fonts = ['satoshi/Satoshi-Bold.ttf', 'DejaVu Sans/DejaVuSans.ttf'].map(f => fs.readFileSync(`./fonts/${f}`))
const defaultFontFamily = {
  sansSerifFamily: 'Satoshi, DejaVu Sans',
  sansSerifFamily: 'Satoshi, DejaVu Sans',
  cursiveFamily: 'Satoshi, DejaVu Sans'
}
async function toPNG({ buffer, headers }) {
  const header = headers.find(a => a['content-type']);
  if (header) {
    const contentType = (header['content-type']);
    if (contentType.includes("svg")) {
      // console.log('is SVG', buffer instanceof Buffer, buffer.length)
      buffer = await svg2png(buffer.toString("utf-8"), {
        fonts, defaultFontFamily
      })
    }
  }

  return buffer;
}