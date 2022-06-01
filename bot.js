// Debug flag

const debug = false

// Twitter library
const Twit = require('twit')
const Queue = require("bee-queue");
const fs = require("fs");
const { curly } = require('node-libcurl');
const { initialize, createSvg2png } = require('svg2png-wasm');
const moment = require("moment");
const utf8 = require('utf8');

require("dotenv").config()

// We need to include our configuration file

let initialized = false;
let svg2png;
// console.log(formatTemplate(process.env.TWITTER_TEMPLATE, {
//   "name": utf8.decode("superman\xf0\x9f\xa6\xb8\xe2\x80\x8d\xe2\x99\x82.eth"),
//   "tokenId": "34079213711217391297172156863573744046950574501157127940254095738189894385198",
//   "created_date": 1653289116276,
//   "price": "0.2 ETH",
//   "platform": "OpenSea",
//   "hashTags": "#emoji",
//   "from": "AD8A38",
//   "to": "8F82DE",
//   "pic": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x4b5826c315174875585abccb7e57b9e72d3e1371036c176e38bd15a64fcffe2e/image"
// }))

// return;

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

// (async function a() {
//   await initializeWasm();
//   item = { pic: 'https://openseauserdata.com/files/c45acf4b2f7068e2dcb6b270d1fd198b.svg' }
//   let { data: buffer, headers } = await curly.get(item.pic);
//   console.log(`1 Pic downloaded:  ${buffer.length}, url: ${item.pic} `);

//   buffer = await toPNG({ buffer, headers });
//   console.log(buffer)
// })();
// return;

const T = new Twit(require('./config.js'))
console.log(T);

const TIMEOUT = 60 * 60 * 1000; // 60 minutes
queue.process(1, async job => {
  await initializeWasm();

  if (Date.now() >= (job.data.created_date || job.options.timestamp) + TIMEOUT) {
    console.log(`OPENSEA => Expired: ${job.data.name} ${moment(job.data.created_date).format("YYYY-MM-DD HH:mm")}`)
    return true;
  }
  try {
    const item = job.data;
    console.log(`Processing ${item.name}...`)
    let resp;
    if (typeof item === 'string') {
      return await T.post('statuses/update', { status: item });
    }

    const status = formatTemplate(process.env.TWITTER_TEMPLATE, item);
    const altText = formatTemplate(process.env.TWITTER_ALT_TEMPLATE, item);

    let mediaIdStr;
    if (item.pic) {
      let { data: buffer, headers } = await curly.get(item.pic);
      console.log(`1 Pic downloaded:  ${buffer.length}, url: ${item.pic} `);
      buffer = await toPNG({ buffer, headers })
      console.log(`2 PNG generated: ${buffer.length || 0}`)
      if (buffer) {
        const { data: { media_id_string } } = await T.post('media/upload', { media_data: buffer.toString("base64") });
        mediaIdStr = media_id_string
        console.log(`3 Media uploaded to Twitter with ID: ${mediaIdStr}`)
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
        const result = await T.post('media/metadata/create', meta_params);
        console.log(`4 Meta created.`)
      }
    }

    console.log(`5 Twitter is ready: ${status}`)
    resp = await T.post('statuses/update', {
      status,
      media_ids: mediaIdStr ? [mediaIdStr] : [],
    });

    console.log(`6 Twitter sent.`)
    sleep(1);
    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
})

function formatTemplate(template, vars) {
  return new Function("return `" + template + "`;").call({ moment, ...vars });
}

console.log("Twitter bot is running...")

async function initializeWasm() {
  if (initialized) return;
  const fonts = ['satoshi/Satoshi-Regular.ttf', 'Plus Jakarta Sans/PlusJakartaSans-VariableFont_wght.ttf', 'DejaVu Sans/DejaVuSans.ttf', 'emoji/NotoColorEmoji.ttf'].map(f => fs.readFileSync(`./fonts/${f}`))
  const defaultFontFamily = {
    sansSerifFamily: 'Satoshi, Plus Jakarta Sans, DejaVu Sans, Noto Color Emoji',
    sansSerifFamily: 'Satoshi, Plus Jakarta Sans, DejaVu Sans, Noto Color Emoji',
    cursiveFamily: 'Satoshi, Plus Jakarta Sans, DejaVu Sans, Noto Color Emoji',
    fantasyFamily: 'Satoshi, Plus Jakarta Sans, DejaVu Sans, Noto Color Emoji',
  }

  await initialize(
    fs.readFileSync('./node_modules/svg2png-wasm/svg2png_wasm_bg.wasm'),
  );

  svg2png = createSvg2png({ fonts, defaultFontFamily });
  initialized = true;
}

async function toPNG({ buffer, headers }) {
  console.log(headers)
  const header = headers.find(a => a['content-type']);
  if (header) {
    const contentType = (header['content-type']);
    if (contentType.includes("svg")) {
      buffer = bufferToPNG(buffer)
    }
  } else {
    console.log('NOT SVG!!', headers)
  }

  return buffer;
}

async function bufferToPNG(buffer) {
  try {
    console.log('is SVG', buffer instanceof Buffer, buffer.length)
    const svg = buffer.toString("utf-8").replace("</svg>", '<text x="150" y="61" font-size="16px" fill="white">ΞNS³.org</text></svg>')
    buffer = Buffer.from(await svg2png(svg));

    return buffer;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n * 1000);
}

// (async () => {
//   await initialize(
//     fs.readFileSync('./node_modules/svg2png-wasm/svg2png_wasm_bg.wasm'),
//   );
//   fs.writeFileSync("./test.png", await toPNG(fs.readFileSync("./test.svg")))
// }
// )();
