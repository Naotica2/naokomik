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

const KOMIKU_API_BASE = "https://api.komiku.org";
const KOMIKU_BASE = "https://komiku.org";

const DEFAULT_HEADERS = {
    referer: "https://komiku.org/",
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export async function getLatestManga(
    page: number = 1,
    tag: string = "hot"
): Promise<PaginatedResponse<Manga>> {
    let crawlUrl: string;

    if (tag === "update") {
        crawlUrl = page === 1
            ? `${KOMIKU_BASE}/update/`
            : `${KOMIKU_BASE}/update/page/${page}/`;
    } else {
        crawlUrl = page === 1
            ? `${KOMIKU_API_BASE}/other/${tag}/`
            : `${KOMIKU_API_BASE}/other/${tag}/page/${page}/`;
    }

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        throw new Error(`Komiku fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const mangaList: Manga[] = [];

    $(".bge").each((_, el) => {
        const title = sanitizeText($(el).find(".kan h3").text());
        const description = sanitizeText($(el).find(".kan p").text());
        const thumbnail = cleanImageUrl($(el).find(".bgei img").attr("src"));
        const latestChapter = sanitizeText(
            $(el).find(".kan .new1").last().find("span").last().text()
        );

        const mangaHref = $(el).find(".kan a").eq(0).attr("href") || "";
        const slugParts = mangaHref.split("/").filter(Boolean);
        const slug = slugParts[slugParts.length - 1] || slugParts[3] || "";

        if (title && slug) {
            mangaList.push({
                title,
                slug,
                thumbnail: sanitizeUrl(thumbnail) || "",
                description,
                latestChapter,
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
 * Search manga on Komiku
 */
export async function searchManga(
    query: string,
    page: number = 1
): Promise<PaginatedResponse<Manga>> {
    let crawlUrl: string;

    if (page === 1) {
        crawlUrl = `${KOMIKU_API_BASE}/?post_type=manga&s=${encodeURIComponent(query)}`;
    } else {
        crawlUrl = `${KOMIKU_API_BASE}/page/${page}/?post_type=manga&s=${encodeURIComponent(query)}`;
    }

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
        throw new Error(`Komiku search failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const mangaList: Manga[] = [];

    $(".bge").each((_, el) => {
        const title = sanitizeText($(el).find(".kan h3").text());
        const description = sanitizeText($(el).find(".kan p").text());
        const thumbnail = cleanImageUrl($(el).find(".bgei img").attr("src"));

        const mangaHref = $(el).find(".kan a").eq(0).attr("href") || "";
        const slugParts = mangaHref.split("/").filter(Boolean);
        // For search results, slug is at different position
        const slug = slugParts[1] || "";

        if (title && slug) {
            mangaList.push({
                title,
                slug,
                thumbnail: sanitizeUrl(thumbnail) || "",
                description,
            });
        }
    });

    return {
        data: mangaList,
        nextPage: mangaList.length > 0 ? `?s=${query}&page=${page + 1}` : null,
        prevPage: page > 1 ? `?s=${query}&page=${page - 1}` : null,
        currentPage: page,
    };
}

/**
 * Get manga detail from Komiku
 */
export async function getMangaDetail(slug: string): Promise<MangaDetail> {
    const crawlUrl = `${KOMIKU_BASE}/manga/${slug}`;

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
        throw new Error(`Komiku detail failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = sanitizeText($("#Judul h1").text());
    const thumbnail = cleanImageUrl($(".ims img").attr("src"));
    const synopsis = sanitizeHtml($(".desc").text());

    const genres: string[] = [];
    $(".genre li a").each((_, el) => {
        const genre = sanitizeText($(el).text());
        if (genre) genres.push(genre);
    });

    const chapters: Chapter[] = [];
    $("#Daftar_Chapter tbody tr").each((i, el) => {
        if (i > 0) {
            // Skip header row
            const chapterNumber = sanitizeText($(el).find(".judulseries").text());
            const chapterHref =
                $(el).find(".judulseries a").attr("href") || "";
            const chapterRelease = sanitizeText($(el).find(".tanggalseries").text());

            let chapterSlug = chapterHref.split("/")[1] || "";
            if (chapterSlug === "ch") {
                chapterSlug = chapterHref.split("ch/")[1] || "";
            }

            if (chapterSlug) {
                chapters.push({
                    number: chapterNumber,
                    slug: chapterSlug,
                    release: chapterRelease,
                    detailUrl: `/komik/read/${encodeURIComponent(chapterSlug)}`,
                });
            }
        }
    });

    // Get similar manga
    const similars: Manga[] = [];
    $("#Spoiler .grd").each((_, el) => {
        const spoilerHref = $(el).find("a").attr("href") || "";
        const hrefParts = spoilerHref.split("/").filter(Boolean);
        const spoilerSlug = hrefParts[hrefParts.length - 1] || "";
        const spoilerTitle = sanitizeText($(el).find(".h4").text());
        const spoilerThumbnail = cleanImageUrl(
            $(el).find("img").attr("data-src")
        );
        const spoilerSynopsis = sanitizeText($(el).find("p").text());

        if (spoilerSlug && spoilerTitle) {
            similars.push({
                title: spoilerTitle,
                slug: spoilerSlug,
                thumbnail: sanitizeUrl(spoilerThumbnail) || "",
                description: spoilerSynopsis,
            });
        }
    });

    return {
        title,
        slug,
        thumbnail: sanitizeUrl(thumbnail) || "",
        synopsis,
        genres,
        chapters,
        similars,
    };
}

/**
 * Get chapter images from Komiku
 */
export async function getChapterImages(slug: string): Promise<ChapterContent> {
    const crawlUrl = `${KOMIKU_BASE}/${slug}`;

    const response = await fetch(crawlUrl, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`Komiku chapter failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const images: string[] = [];
    $("#Baca_Komik img").each((_, el) => {
        let imageUrl = $(el).attr("src");
        if (imageUrl) {
            imageUrl = cleanImageUrl(imageUrl);
            const sanitized = sanitizeUrl(imageUrl);
            if (sanitized) images.push(sanitized);
        }
    });

    // Extract manga metadata for history
    const title = sanitizeText($("title").text()) || sanitizeText($("h1").first().text());
    const mangaTitle = sanitizeText($("#Judul h1").text()) ||
        sanitizeText($(".chapter-title").text()) ||
        title?.replace(/Chapter.*$/i, "").trim() ||
        "";

    // Try to extract manga slug from breadcrumb or links
    const mangaLink = $("a[href*='/manga/']").attr("href") || "";
    const mangaSlugParts = mangaLink.split("/").filter(Boolean);
    const mangaSlug = mangaSlugParts[mangaSlugParts.length - 1] || slug.split("-chapter")[0] || "";

    // Get thumbnail if available
    const mangaThumbnail = cleanImageUrl($(".chapter-manga-thumbnail img").attr("src")) ||
        cleanImageUrl($("meta[property='og:image']").attr("content")) || "";

    // Extract chapter number
    const chapterNumber = title?.match(/Chapter\s*([\d.]+)/i)?.[1] ||
        slug.match(/chapter-?([\d.]+)/i)?.[1] ||
        "";

    // Get navigation chapters
    const prevChapter = sanitizeText($("a.prev").attr("href")?.split("/")[1] || "");
    const nextChapter = sanitizeText($("a.next").attr("href")?.split("/")[1] || "");

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

