import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes text content by removing all HTML tags
 * Used for titles, descriptions, and other text content
 */
export function sanitizeText(dirty: string | undefined | null): string {
    if (!dirty) return "";
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitizes HTML content while allowing basic formatting tags
 * Used for synopsis and rich text content
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
    if (!dirty) return "";
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "span"],
        ALLOWED_ATTR: [],
    }).trim();
}

/**
 * Sanitizes a URL to prevent XSS through URL schemes
 */
export function sanitizeUrl(url: string | undefined | null): string {
    if (!url) return "";

    // Only allow http and https protocols
    try {
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return url;
        }
    } catch {
        // If URL parsing fails, return empty string
    }

    // Check if it's a relative URL (starts with /)
    if (url.startsWith("/")) {
        return url;
    }

    return "";
}

/**
 * Sanitizes an array of URLs
 */
export function sanitizeUrls(urls: (string | undefined | null)[]): string[] {
    return urls.map(sanitizeUrl).filter((url) => url !== "");
}
