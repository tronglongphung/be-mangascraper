import { PaginatedManga, SearchMangaQuery, IManga } from './interfaces';
export declare class Manganelo {
    /**
     * @param {string} id - Manga ID
     * @return {Promise<IManga>} - A Object containing manga data
     * @example
     *
     *    getMangaByID('black_clover')
     *
     */
    getMangaByID(id: string): Promise<IManga>;
    /**
     * @param {SearchMangaQuery} search - Manga Advance Search Query
     * @return {Promise<PaginatedManga>} - A PaginatedManga result
     * @example
     *
     *    searchManga({ include: "Action" })
     *
     */
    searchManga(search?: SearchMangaQuery): Promise<PaginatedManga>;
    /**
     * @param {string} id - Manga id
     * @param {string} chapter - chapter id
     * @return {Promise<{id:string, uri:string}>} - A Array of Object containing panels data
     * @example
     *
     *    getChapterPanels('black_clover', '1')
     *
     */
    getChapterPanels(id: string, chapter: string): Promise<{
        id: number;
        uri: string;
    }[]>;
    

    /**
     * @param {SearchMangaQuery} search - Manga Advance Search Query
     * @return {Promise<PaginatedManga>} - A PaginatedManga result
     * @example
     *
     *    searchManga({ include: "Action" })
     *
     */
     fetchAllManga(search?: SearchMangaQuery): Promise<PaginatedManga>;
    private createQueryParams;
}
