const cheerio = require("cheerio");
const fetch = require("node-fetch");

const PROXY_URL = "https://thingproxy.freeboard.io/fetch/";
const BASE_URL = PROXY_URL + "https://manganato.com/genre-all";

async function fetchAllManga() {
  const response = await fetch(BASE_URL);
  const html = await response.text();
  const $ = cheerio.load(html);
  const $body = $("body");
  const $contentGenres = $body.find(".panel-content-genres");
  const contentGenres = $contentGenres.length;
  // console.log(contentGenres);
  //if no items found
  if (!$contentGenres.length) {
    return {
      data: [],
      metadata: {
        hasNext: false,
        hasPrev: false,
        itemCount: 0,
        totalItems: 0,
        totalPage: 0,
        currentPage: 0,
      },
    };
  }
  //items found
  const $genres = $contentGenres.children();
  // this map does not work properly
  const mangas = $genres
    .map((_, el) => {
      const $itemImg = $(el).find(".genres-item-img");
      const $itemInfo = $(el).find(".genres-item-info");
      const [, slug] = $itemImg.attr("href").match(/manga\/([A-Za-z0-9_]+)/);
      const imageUrl = $itemImg.find("img").attr("src");
      console.log(imageUrl);
      const title = $itemInfo.find("h3").text();
      const $genresItemChap = $itemInfo.find(".genres-item-chap");
      const chapterTitle = $genresItemChap.attr("title");
      const [, chapter] = $genresItemChap
        .attr("href")
        .match(/chapter_([0-9.]+)/);
      return {
        slug,
        title,
        imageUrl,
        latestChapter: {
          id: slug,
          chapter,
          title: chapterTitle,
        },
        flair,
      };
    })
    .get();
  console.log(mangas);

  const $pageNumber = $body.find(".panel-page-number");
  const hasPageNumber = !!$pageNumber.length;
  if (hasPageNumber) {
    const $groupPage = $pageNumber.find(".group-page");
    const firstPage = 1;
    const currentPage = Number($groupPage.find(".page-select").text());
    const [, $lastPage] = $groupPage
      .find(".page-blue.page-last")
      .text()
      .match(/LAST\(([0-9]+)\)/);
    const [, $totalItems] = $pageNumber.find(".group-qty a").text().split(":");
    const lastPage = Number($lastPage);
    const totalItems = Number($totalItems.trim().replace(/,/g, ""));
    return {
      data: mangas,
      metadata: {
        hasNext: currentPage < lastPage,
        hasPrev: currentPage > firstPage,
        itemCount: mangas.length,
        totalItems: totalItems,
        totalPage: lastPage,
        currentPage,
      },
    };
  }
  return {
    data: mangas,
    metadata: {
      hasNext: false,
      hasPrev: false,
      itemCount: mangas.length,
      totalItems: mangas.length,
      totalPage: 1,
      currentPage: 1,
    },
  };
}

module.exports = { fetchAllManga };
