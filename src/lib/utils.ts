import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format a date string to "time ago" format
 */
export function formatTimeAgo(dateString: string | undefined): string {
    if (!dateString) return "";

    try {
        // Try to parse various date formats
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // If parsing fails, return the original string
            return dateString;
        }

        return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch {
        return dateString;
    }
}

/**
 * Slugify a string for URL usage
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
}

/**
 * Extract slug from a URL path
 */
export function extractSlug(url: string, position: number = -1): string {
    const parts = url.split("/").filter(Boolean);
    if (position < 0) {
        position = parts.length + position;
    }
    return parts[position] || "";
}

/**
 * Build proxy URL for images
 */
export function buildProxyUrl(
    originalUrl: string | undefined,
    baseUrl: string
): string {
    if (!originalUrl) return "";

    // Don't proxy if already proxied
    if (originalUrl.includes("/api/proxy")) {
        return originalUrl;
    }

    // Don't proxy relative URLs or data URLs
    if (
        !originalUrl.startsWith("http://") &&
        !originalUrl.startsWith("https://")
    ) {
        return originalUrl;
    }

    const encodedUrl = encodeURIComponent(originalUrl);
    return `${baseUrl}/api/proxy?url=${encodedUrl}`;
}

/**
 * Build proxy URLs for an array of images
 */
export function buildProxyUrls(urls: string[], baseUrl: string): string[] {
    return urls.map((url) => buildProxyUrl(url, baseUrl)).filter(Boolean);
}

/**
 * Get the base URL from request
 */
export function getBaseUrl(req?: Request): string {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    if (req) {
        const url = new URL(req.url);
        return url.origin;
    }

    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

/**
 * Clean and normalize image URL
 */
export function cleanImageUrl(url: string | undefined): string {
    if (!url) return "";

    // Remove query parameters that might cause issues
    const cleanUrl = url.split("?")[0];

    // Replace known CDN issues
    return cleanUrl.replace("img.komiku.id", "cdn.komiku.co.id");
}

/**
 * Delay utility for rate limiting scraper requests
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                await delay(initialDelay * Math.pow(2, i));
            }
        }
    }

    throw lastError;
}
