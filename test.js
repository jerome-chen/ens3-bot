const { curly } = require('node-libcurl');

const download = async () => { return await curly.get("https://openseauserdata.com/files/c84f975f9c21c15eb85b01c07cb223fe.svg") };
download().then(({ data }) => console.log(data.toString("base64")));