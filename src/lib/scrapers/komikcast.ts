import * as cheerio from "cheerio";
import type {
    Manga,
    MangaDetail,
    ChapterContent,
    Chapter,
    PaginatedResponse,
} from "@/types/manga";
import { sanitizeText, sanitizeHtml, sanitizeUrl } from "@/lib/sanitizer";
import { cleanImageUrl } from "@/lib/utils";

const KOMIKCAST_BASE =
    process.env.KOMIKCAST_LINK || "https://komikcast03.com";

const DEFAULT_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
};

/**
 * Fetch latest manga from Komikcast
 * @param page - Page number
 * @param tag - Sort tag: "hot" for popular, "update" for latest updates
 */
export async function getLatestManga(
    page: number = 1,
    tag: string = "hot"
): Promise<PaginatedResponse<Manga>> {
    // Map tag to Komikcast sortby parameter
    const sortby = tag === "update" ? "update" : "popular";
    const crawlUrl = `${KOMIKCAST_BASE}/daftar-komik/page/${page}/?sortby=${sortby}`;

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
        throw new Error(`Komikcast fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const mangaList: Manga[] = [];

    $(".list-update_items-wrapper .list-update_item").each((_, el) => {
        const title = sanitizeText(
            $(el).find(".list-update_item-info .title").text()
        );
        const thumbnail = $(el)
            .find(".list-update_item-image .wp-post-image")
            .attr("src");
        const rating = sanitizeText(
            $(el).find(".list-update_item-info .rating .numscore").text()
        );
        const type = sanitizeText(
            $(el).find(".list-update_item-image .type").text()
        );

        const mangaHref = $(el).find("a").attr("href") || "";
        const slug = mangaHref.split("/")[4] || "";

        if (title && slug) {
            mangaList.push({
                title,
                slug,
                thumbnail: sanitizeUrl(cleanImageUrl(thumbnail)) || "",
                rating,
                type,
            });
        }
    });

    return {
        data: mangaList,
        nextPage: mangaList.length > 0 ? `?page=${page + 1}&tag=${tag}` : null,
        prevPage: page > 1 ? `?page=${page - 1}&tag=${tag}` : null,
        currentPage: page,
    };
}

/**
 * Search manga on Komikcast
 */
export async function searchManga(
    query: string,
    page: number = 1
): Promise<PaginatedResponse<Manga>> {
    const crawlUrl = `${KOMIKCAST_BASE}/page/${page}/?s=${encodeURIComponent(query)}`;

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 60 },
    });

    if (!response.ok) {
        throw new Error(`Komikcast search failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const mangaList: Manga[] = [];

    $(".list-update_items-wrapper .list-update_item").each((_, el) => {
        const title = sanitizeText(
            $(el).find(".list-update_item-info .title").text()
        );
        const thumbnail = $(el)
            .find(".list-update_item-image .wp-post-image")
            .attr("src");
        const rating = sanitizeText(
            $(el).find(".list-update_item-info .rating .numscore").text()
        );
        const type = sanitizeText(
            $(el).find(".list-update_item-image .type").text()
        );

        const mangaHref = $(el).find("a").attr("href") || "";
        const slug = mangaHref.split("/")[4] || "";

        if (title && slug) {
            mangaList.push({
                title,
                slug,
                thumbnail: sanitizeUrl(cleanImageUrl(thumbnail)) || "",
                rating,
                type,
            });
        }
    });

    const hasMore = mangaList.length === 60; // Komikcast returns 60 per page

    return {
        data: mangaList,
        nextPage: hasMore ? `?s=${query}&page=${page + 1}` : null,
        prevPage: page > 1 ? `?s=${query}&page=${page - 1}` : null,
        currentPage: page,
    };
}

/**
 * Get manga detail from Komikcast
 */
export async function getMangaDetail(slug: string): Promise<MangaDetail> {
    const crawlUrl = `${KOMIKCAST_BASE}/manga/${slug}`;

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`Komikcast detail failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = sanitizeText(
        $(".komik_info-content .komik_info-content-body .komik_info-content-body-title").text()
    );
    const thumbnail = $(
        ".komik_info-content .komik_info-content-thumbnail img"
    ).attr("src");
    const synopsis = sanitizeHtml(
        $(".komik_info-description .komik_info-description-sinopsis p").text()
    );

    // Parse metadata
    const meta: Record<string, string> = {};
    $(".komik_info-content-meta span").each((_, el) => {
        const text = $(el).text();
        const [key, value] = text.split(":").map((s) => s.trim());
        if (key && value) {
            meta[key.toLowerCase().replace(/\s+/g, "_")] = value.toLowerCase();
        }
    });

    // Parse genres
    const genres: string[] = [];
    $(".komik_info-content-genre .genre-item").each((_, el) => {
        const genre = sanitizeText($(el).text());
        if (genre) genres.push(genre);
    });

    // Parse chapters
    const chapters: Chapter[] = [];
    $(".komik_info-chapters-wrapper li").each((_, el) => {
        const chapterNumber = sanitizeText(
            $(el).find("a").text().replace("Chapter", "")
        );
        const chapterHref = $(el).find("a").attr("href") || "";
        const chapterSlug = chapterHref.split("/")[4] || "";
        const chapterRelease = sanitizeText(
            $(el).find(".chapter-link-time").text()
        );

        if (chapterSlug) {
            chapters.push({
                number: chapterNumber,
                slug: chapterSlug,
                release: chapterRelease,
                detailUrl: `/komik/read/${encodeURIComponent(chapterSlug)}`,
            });
        }
    });

    return {
        title,
        slug,
        thumbnail: sanitizeUrl(cleanImageUrl(thumbnail)) || "",
        synopsis,
        genres,
        status: meta.status,
        author: meta.author,
        type: meta.type,
        chapters,
    };
}

/**
 * Get chapter images from Komikcast
 */
export async function getChapterImages(slug: string): Promise<ChapterContent> {
    const crawlUrl = `${KOMIKCAST_BASE}/chapter/${slug}`;

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error(`Komikcast chapter failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const images: string[] = [];
    $(".main-reading-area img").each((_, el) => {
        const imageUrl = $(el).attr("src");
        if (imageUrl) {
            const sanitized = sanitizeUrl(cleanImageUrl(imageUrl));
            if (sanitized) images.push(sanitized);
        }
    });

    // Extract manga metadata for history
    const title = sanitizeText($("title").text()) || sanitizeText($("h1").first().text());
    const mangaTitle = sanitizeText($(".chapter-heading").text())?.replace(/Chapter.*$/i, "").trim() ||
        sanitizeText($("h1.entry-title").text())?.replace(/Chapter.*$/i, "").trim() ||
        title?.replace(/Chapter.*$/i, "").trim() ||
        "";

    // Try to extract manga slug from links
    const mangaLink = $("a[href*='/manga/']").attr("href") || "";
    const mangaSlugParts = mangaLink.split("/").filter(Boolean);
    const mangaSlug = mangaSlugParts[mangaSlugParts.length - 1] || slug.split("-chapter")[0] || "";

    // Get thumbnail if available
    const mangaThumbnail = cleanImageUrl($("meta[property='og:image']").attr("content")) || "";

    // Extract chapter number
    const chapterNumber = title?.match(/Chapter\s*([\d.]+)/i)?.[1] ||
        slug.match(/chapter-?([\d.]+)/i)?.[1] ||
        "";

    // Get navigation chapters
    const prevLink = $(".prev_pic a, .ch-prev-btn").attr("href") || "";
    const nextLink = $(".next_pic a, .ch-next-btn").attr("href") || "";
    const prevChapterRaw = prevLink.split("/").filter(Boolean).pop() || "";
    const nextChapterRaw = nextLink.split("/").filter(Boolean).pop() || "";

    // Validate that a slug is actually a chapter slug, not a manga or other page
    const isValidChapterSlug = (chapterSlug: string): boolean => {
        if (!chapterSlug) return false;
        const lowerSlug = chapterSlug.toLowerCase();
        // Chapter slugs should contain 'ch' or 'chapter' or end with chapter number pattern
        const isChapter = lowerSlug.includes('ch') ||
            /chapter|\d+$/.test(lowerSlug) ||
            /-(\d+)(-|$)/.test(lowerSlug);
        // Exclude manga pages or other non-chapter pages
        const isNotMangaPage = !lowerSlug.startsWith('manga') &&
            lowerSlug !== 'manga' &&
            !lowerSlug.includes('/manga/');
        return isChapter && isNotMangaPage;
    };

    const prevChapter = isValidChapterSlug(prevChapterRaw) ? prevChapterRaw : "";
    const nextChapter = isValidChapterSlug(nextChapterRaw) ? nextChapterRaw : "";

    return {
        images,
        title,
        mangaSlug: sanitizeText(mangaSlug),
        mangaTitle: sanitizeText(mangaTitle),
        mangaThumbnail: sanitizeUrl(mangaThumbnail) || "",
        chapterNumber: `Chapter ${chapterNumber}`,
        prevChapter: prevChapter || undefined,
        nextChapter: nextChapter || undefined,
    };
}

