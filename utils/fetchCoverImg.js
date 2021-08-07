const cheerio = require("cheerio");
const fetch = require("node-fetch");

const PROXY_URL = "https://thingproxy.freeboard.io/fetch/";
const BASE_URL = PROXY_URL + "https://manganelo.com/";

async function fetchCoverImg(url) {
  const response = await fetch(PROXY_URL + url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const $body = $("body");
  const $itemImg = $body.find(".info-image");
  const imageUrl = $itemImg.find("img").attr("src");
  return imageUrl;
}

module.exports = { fetchCoverImg };
