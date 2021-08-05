const cheerio = require("cheerio");
const fetch = require("node-fetch");

async function getChapterPanels(url) {
  const response = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  const notFound = $("body")
    .text()
    .match(/PAGE NOT FOUND/g);
  if (notFound) throw new Error("Chapter not found");
  const $body = $("body");
  const $chapters = $body.find(".container-chapter-reader").children("img");
  const panels = $chapters
    .map((_, $el) => {
      const src = $($el).attr("src");
      const [, id] = src.match(/([0-9]+)\.(jp(e)?g|png)/);
      return { id: id, uri: src };
    })
    .get();
  // console.log('within function panels array here');
  // console.log(panels);
  return panels;
}

module.exports = { getChapterPanels };
