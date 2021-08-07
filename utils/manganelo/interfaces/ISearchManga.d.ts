import { MangaGenre, SearchOrderBy, SearchStatus, SearchType } from '../enums';
import { IManga } from '../interfaces';
export interface SearchMangaQuery {
    /** Search key  */
    searchKey?: SearchType;
    /** Search keyword*/
    searchWord?: string;
    /** Order results by */
    orderBy?: SearchOrderBy;
    /** Status of manga to be searched */
    status?: SearchStatus;
    /** Include anga genre to be search*/
    includes?: MangaGenre[];
    /** Exclude anga genre to be search*/
    excludes?: MangaGenre[];
    /** Paginate page */
    page?: number;
}
export interface PaginatedManga {
    data: IManga[];
    metadata: {
        itemCount: number;
        totalPage: number;
        totalItems: number;
        currentPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
