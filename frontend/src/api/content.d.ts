import { ContentCreate, ContentUpdate, ContentOut } from '../types';
export declare function createContent(content: ContentCreate): Promise<ContentOut>;
export declare function listContent(author_id?: string): Promise<ContentOut[]>;
export declare function getContent(id: string): Promise<ContentOut>;
export declare function updateContent(id: string, content: ContentUpdate): Promise<ContentOut>;
export declare function deleteContent(id: string): Promise<void>;
