const cheerio = require("cheerio");
const fetch = require("node-fetch");
const { stringify } = require("qs");
const { BASE_URL } = require("./constants");
class Manganelo {
  /**
   * @param {string} id - Manga ID
   * @return {Promise<IManga>} - A Object containing manga data
   * @example
   *
   *    getMangaByID('black_clover')
   *
   */
  Manganelo(useProxy) {
    if (useProxy === true) {
      this.BASE_URL = "https://thingproxy.freeboard.io/fetch/" + this.BASE_URL;
    }
  }
  async getMangaByID(id) {
    if (!id) throw new Error("Manga `id` should not be empty");
    if (!(typeof id === "string"))
      throw new TypeError("Manga `id` should be a string");
    const response = await fetch(BASE_URL + "manga/" + id);
    const html = await response.text();
    const serverError = html.includes(
      "Your system folder path does not appear to be set correctly."
    );
    if (serverError) throw new Error("Manganelo server error");
    const notFound = html.includes("404 - PAGE NOT FOUND");
    if (notFound) throw new Error(`Manga with id '${id}' not found`);
    const $ = cheerio.load(html);
    const $body = $("body");
    const $storyInfo = $body.find(".panel-story-info");
    const $storyInfoLeft = $body.find(".story-info-left");
    const $storyInfoRight = $storyInfo.find(".story-info-right");
    const $variations = $storyInfoRight.find(
      "table.variations-tableInfo > tbody"
    );
    const $alternativeTitles = $variations
      .find(".info-alternative")
      .closest("td")
      .next("td")
      .find("h2");
    const $authors = $variations
      .find(".info-author")
      .closest("td")
      .next("td")
      .children();
    const $status = $variations.find(".info-status").closest("td").next("td");
    const $genres = $variations
      .find(".info-genres")
      .closest("td")
      .next("td")
      .children();
    const $extent = $storyInfoRight.find(".story-info-right-extent");
    const $updated = $extent.find(".info-time").closest("span").next("span");
    const $views = $extent.find(".info-view").closest("span").next("span");
    const $rates = $extent.find("p #rate_row_cmd");
    const $bookmark = $extent.find("p.info-bookmark .notif-bookmark");
    const $description = $storyInfo.find(".panel-story-info-description");
    const $chapterList = $body
      .find(".panel-story-chapter-list .row-content-chapter")
      .children("li");
    const imageUrl = $storyInfoLeft
      .find(".info-image > .img-loading")
      .attr("src");
    const hotFlair = !!$storyInfoLeft.find(".info-image .item-hot").length;
    const flair = hotFlair ? "hot" : null;
    const title = $storyInfoRight.find("h1").text();
    const alternativeTitles = $alternativeTitles
      .text()
      .split(";")
      .map((title) => title.trim());
    const authors = $authors
      .map((_, $el) => {
        const href = $($el).attr("href");
        const match = href.match(/author\/([A-Za-z0-9]+)/);
        let id = "";
        if (match) {
          id = match[1];
        }
        const name = $($el).text();
        return { id, name };
      })
      .get();
    const status = $status.text();
    const genres = $genres
      .map((_, $el) => {
        const href = $($el).attr("href");
        const [, id] = href.match(/\/genre-([0-9]+)/);
        const genre = $($el).text();
        return { id, genre };
      })
      .get();
    const rawUpdatedDate = $updated.text().trim();
    const lastUpdatedPretty = rawUpdatedDate.replace(" - ", " ");
    /**
     * lastUpdated - sometimes returns Invalid Date, idk why
     * Date parsing inconsistencies?
     */
    const lastUpdated = new Date(lastUpdatedPretty);
    const numberOfViews = Number($views.text().replace(/,/g, ""));
    const numberOfVotes = Number($rates.find('[property="v:votes"]').text());
    const rating = Number($rates.find('[property="v:average"]').text());
    const isBookmarked = !!$bookmark.text();
    const [, description] = $description.text().split("Description :");
    const chapters = $chapterList
      .map((_, $el) => {
        const $chapterName = $($el).find(".chapter-name");
        const href = $chapterName.attr("href");
        const [, chapter] = href.match(/chapter_([0-9.]+)/);
        const title = $chapterName.text();
        const numberOfViews = Number(
          $($el).find(".chapter-view").text().replace(/,/g, "")
        );
        const uploadDateRaw = $($el).find(".chapter-time").attr("title");
        const uploadDate = new Date(uploadDateRaw);
        return { chapter, title, numberOfViews, uploadDate };
      })
      .get();
    const data = {
      slug: id,
      imageUrl,
      title,
      alternativeTitles,
      status,
      lastUpdated,
      lastUpdatedPretty,
      numberOfViews,
      numberOfVotes,
      rating,
      isBookmarked,
      description,
      authors,
      genres,
      chapters,
      flair,
    };
    return data;
  }
  /**
   * @param {SearchMangaQuery} search - Manga Advance Search Query
   * @return {Promise<PaginatedManga>} - A PaginatedManga result
   * @example
   *
   *    searchManga({ include: "Action" })
   *
   */
  async searchManga(search) {
    const query = stringify(this.createQueryParams(search));
    const response = await fetch(BASE_URL + "/advanced_search?" + query);
    const html = await response.text();
    const $ = cheerio.load(html);
    const $body = $("body");
    const $contentGenres = $body.find(".panel-content-genres");
    //no items found
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
    const $genres = $contentGenres.children();
    const mangas = $genres
      .map((_, el) => {
        const $itemImg = $(el).find(".genres-item-img");
        const $itemInfo = $(el).find(".genres-item-info");
        const [, slug] = $itemImg.attr("href").match(/manga\/([A-Za-z0-9_]+)/);
        const imageUrl = $itemImg.find("img").attr("src");
        const hotFlair = !!$itemImg.find(".genres-item-hot").length;
        const newFlair = !!$itemImg.find(".genres-item-new").length;
        const flair = hotFlair ? "hot" : newFlair ? "new" : null;
        const rating = Number($itemImg.find(".genres-item-rate").text());
        const title = $itemInfo.find("h3").text();
        const $genresItemChap = $itemInfo.find(".genres-item-chap");
        const chapterTitle = $genresItemChap.attr("title");
        const [, chapter] = $genresItemChap
          .attr("href")
          .match(/chapter_([0-9.]+)/);
        const views = Number(
          $itemInfo.find(".genres-item-view").text().replace(/,/g, "")
        );
        const lastUpdatedPretty = $itemInfo.find(".genres-item-time").text();
        const lastUpdated = new Date(lastUpdatedPretty.trim());
        const authors = $itemInfo
          .find(".genres-item-author")
          .text()
          .split(",")
          .map((author) => ({ name: author }));
        const description = $itemInfo.find(".genres-item-description").text();
        return {
          slug,
          title,
          imageUrl,
          authors,
          description,
          rating,
          numberOfViews: views,
          lastUpdated,
          lastUpdatedPretty,
          latestChapter: {
            id: slug,
            chapter,
            title: chapterTitle,
            uploadDate: lastUpdated,
          },
          flair,
        };
      })
      .get();
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
      const [, $totalItems] = $pageNumber
        .find(".group-qty a")
        .text()
        .split(":");
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
  /**
   * @param {string} id - Manga id
   * @param {string} chapter - chapter id
   * @return {Promise<{id:string, uri:string}>} - A Array of Object containing panels data
   * @example
   *
   *    getChapterPanels('black_clover', '1')
   *
   */
  async getChapterPanels(id, chapter) {
    if (!id) throw new Error("Manga `id` is required");
    if (!chapter) throw new Error("Manga `chapter` is required");
    const response = await fetch(BASE_URL + `chapter/${id}/chapter_${chapter}`);
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
    return panels;
  }

  /**
   * @param {SearchMangaQuery} search - Manga Advance Search Query
   * @return {Promise<PaginatedManga>} - A PaginatedManga result
   * @example
   *
   *    fetchAllManga("genre-all")
   *
   */
  async fetchAllManga(search) {
    const query = stringify(this.createQueryParams(search));

    const response = await fetch(BASE_URL + "/" + query);
    const html = await response.text();
    const $ = cheerio.load(html);
    const $body = $("body");
    const $contentGenres = $body.find(".panel-content-genres");
    //no items found
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
    const $genres = $contentGenres.children();
    const mangas = $genres
      .map((_, el) => {
        const $itemImg = $(el).find(".genres-item-img");
        const $itemInfo = $(el).find(".genres-item-info");
        const [, slug] = $itemImg.attr("href").match(/manga\/([A-Za-z0-9_]+)/);
        const imageUrl = $itemImg.find("img").attr("src");
        const hotFlair = !!$itemImg.find(".genres-item-hot").length;
        const newFlair = !!$itemImg.find(".genres-item-new").length;
        const flair = hotFlair ? "hot" : newFlair ? "new" : null;
        const rating = Number($itemImg.find(".genres-item-rate").text());
        const title = $itemInfo.find("h3").text();
        const $genresItemChap = $itemInfo.find(".genres-item-chap");
        const chapterTitle = $genresItemChap.attr("title");
        const [, chapter] = $genresItemChap
          .attr("href")
          .match(/chapter_([0-9.]+)/);
        const views = Number(
          $itemInfo.find(".genres-item-view").text().replace(/,/g, "")
        );
        const lastUpdatedPretty = $itemInfo.find(".genres-item-time").text();
        const lastUpdated = new Date(lastUpdatedPretty.trim());
        const authors = $itemInfo
          .find(".genres-item-author")
          .text()
          .split(",")
          .map((author) => ({ name: author }));
        const description = $itemInfo.find(".genres-item-description").text();
        return {
          slug,
          title,
          imageUrl,
          authors,
          description,
          rating,
          numberOfViews: views,
          lastUpdated,
          lastUpdatedPretty,
          latestChapter: {
            id: slug,
            chapter,
            title: chapterTitle,
            uploadDate: lastUpdated,
          },
          flair,
        };
      })
      .get();
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
      const [, $totalItems] = $pageNumber
        .find(".group-qty a")
        .text()
        .split(":");
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

  createQueryParams(search) {
    const searchQuery = { s: "all", page: 1 };
    if (search.excludes) {
      searchQuery["g_e"] =
        "_" + search.excludes.map((ex) => getGenre(ex)).join("_") + "_";
    }
    if (search.includes) {
      searchQuery["g_i"] =
        "_" + search.includes.map((ex) => getGenre(ex)).join("_") + "_";
    }
    if (search.orderBy) {
      searchQuery["orby"] = search.orderBy;
    }
    if (search.status) {
      searchQuery["sts"] = search.status;
    }
    if (search.searchKey) {
      searchQuery["keyt"] = search.searchKey;
    }
    if (search.searchWord) {
      searchQuery["keyw"] = search.searchWord
        .replace(/ /g, "_")
        .replace(/[^\w\s]/gi, "")
        .toLowerCase();
    }
    if (search.page) {
      searchQuery["page"] = search.page;
    }
    return searchQuery;
  }
}

module.exports = Manganelo;
