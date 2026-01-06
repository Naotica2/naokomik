import * as komiku from "./komiku";
import * as komikcast from "./komikcast";
import type {
    Manga,
    MangaDetail,
    ChapterContent,
    PaginatedResponse,
    ScraperSource,
} from "@/types/manga";

interface FailoverResult<T> {
    data: T;
    source: ScraperSource;
}

/**
 * Smart Failover wrapper - tries primary source first, falls back to secondary
 */
async function withFailover<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    validateResult?: (result: T) => boolean
): Promise<FailoverResult<T>> {
    try {
        const result = await primaryFn();

        // Validate result if validator provided
        if (validateResult && !validateResult(result)) {
            throw new Error("Primary source returned invalid/empty result");
        }

        return { data: result, source: "komiku" };
    } catch (primaryError) {
        console.warn("[Scraper] Primary source (Komiku) failed:", primaryError);

        try {
            const result = await fallbackFn();

            if (validateResult && !validateResult(result)) {
                throw new Error("Fallback source returned invalid/empty result");
            }

            return { data: result, source: "komikcast" };
        } catch (fallbackError) {
            console.error(
                "[Scraper] Fallback source (Komikcast) also failed:",
                fallbackError
            );
            throw new Error(
                `Both scrapers failed. Primary: ${primaryError}. Fallback: ${fallbackError}`
            );
        }
    }
}

/**
 * Validate manga list response
 */
function validateMangaList(result: PaginatedResponse<Manga>): boolean {
    return Array.isArray(result.data) && result.data.length > 0;
}

/**
 * Validate manga detail response
 */
function validateMangaDetail(result: MangaDetail): boolean {
    return Boolean(result.title && result.chapters?.length > 0);
}

/**
 * Validate chapter content response
 */
function validateChapterContent(result: ChapterContent): boolean {
    return Array.isArray(result.images) && result.images.length > 0;
}

// ============================================
// Exported Smart Failover Functions
// ============================================

/**
 * Get latest/popular manga with automatic failover
 */
export async function getLatestManga(
    page: number = 1,
    tag: string = "hot"
): Promise<FailoverResult<PaginatedResponse<Manga>>> {
    return withFailover(
        () => komiku.getLatestManga(page, tag),
        () => komikcast.getLatestManga(page),
        validateMangaList
    );
}

/**
 * Search manga with automatic failover
 */
export async function searchManga(
    query: string,
    page: number = 1
): Promise<FailoverResult<PaginatedResponse<Manga>>> {
    return withFailover(
        () => komiku.searchManga(query, page),
        () => komikcast.searchManga(query, page),
        validateMangaList
    );
}

/**
 * Get manga detail with automatic failover
 */
export async function getMangaDetail(
    slug: string
): Promise<FailoverResult<MangaDetail>> {
    return withFailover(
        () => komiku.getMangaDetail(slug),
        () => komikcast.getMangaDetail(slug),
        validateMangaDetail
    );
}

/**
 * Get chapter images with automatic failover
 */
export async function getChapterImages(
    slug: string
): Promise<FailoverResult<ChapterContent>> {
    return withFailover(
        () => komiku.getChapterImages(slug),
        () => komikcast.getChapterImages(slug),
        validateChapterContent
    );
}

// Re-export types
export type { Manga, MangaDetail, ChapterContent, PaginatedResponse };
