import { MangaStatus, MangaGenre } from '../enums';
export interface IAuthor {
    id?: string;
    name: string;
}
export interface IMangaGenre {
    id: string;
    genre: MangaGenre;
}
export interface IMangaChapter {
    id: string;
    chapter: string;
    title: string;
    numberOfViews?: number;
    uploadDate: Date;
}
export interface IManga {
    slug: string;
    title: string;
    imageUrl?: string;
    alternativeTitles?: string[];
    authors: IAuthor[];
    status?: MangaStatus;
    genres?: IMangaGenre[];
    lastUpdated?: Date;
    lastUpdatedPretty?: string;
    numberOfViews?: number;
    rating?: number;
    numberOfVotes?: number;
    description?: string;
    chapters?: IMangaChapter[];
    isBookmarked?: boolean;
    flair?: string;
    latestChapter?: IMangaChapter;
}
