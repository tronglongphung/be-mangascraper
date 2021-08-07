import NodeCache from 'node-cache';
import { MangaGenre } from '../enums';
export declare const cache: NodeCache;
export declare function getGenre(genre: MangaGenre): number;
