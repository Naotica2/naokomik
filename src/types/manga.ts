// ============================================
// Manga Types
// ============================================

export interface Manga {
    title: string;
    slug: string;
    thumbnail: string;
    description?: string;
    latestChapter?: string;
    type?: "Manga" | "Manhwa" | "Manhua" | string;
    rating?: string;
    updateTime?: string;
}

export interface MangaDetail {
    title: string;
    slug: string;
    thumbnail: string;
    synopsis: string;
    genres: string[];
    type?: string;
    status?: string;
    author?: string;
    rating?: string;
    chapters: Chapter[];
    similars?: Manga[];
}

export interface Chapter {
    number: string;
    slug: string;
    release: string;
    detailUrl: string;
}

export interface ChapterContent {
    images: string[];
    title?: string;
    prevChapter?: string;
    nextChapter?: string;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
    data: T[];
    nextPage: string | null;
    prevPage: string | null;
    currentPage: number;
}

export interface ApiResponse<T> {
    data: T;
    error?: {
        message: string;
        code?: string;
    };
}

// ============================================
// Scraper Types
// ============================================

export type ScraperSource = "komiku" | "komikcast";

export interface ScraperConfig {
    source: ScraperSource;
    baseUrl: string;
}

export interface ScraperResult<T> {
    data: T;
    source: ScraperSource;
}
