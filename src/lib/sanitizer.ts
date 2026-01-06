/**
 * Lightweight sanitizer that works without jsdom
 * Avoids ESM/CommonJS conflicts on Vercel
 */

// HTML entities to decode
const HTML_ENTITIES: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
};

/**
 * Decode HTML entities
 */
function decodeEntities(text: string): string {
    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
        if (entity in HTML_ENTITIES) {
            return HTML_ENTITIES[entity];
        }
        // Handle numeric entities
        if (entity.startsWith("&#x")) {
            const hex = entity.slice(3, -1);
            return String.fromCharCode(parseInt(hex, 16));
        }
        if (entity.startsWith("&#")) {
            const num = entity.slice(2, -1);
            return String.fromCharCode(parseInt(num, 10));
        }
        return entity;
    });
}

/**
 * Sanitizes text content by removing all HTML tags
 * Used for titles, descriptions, and other text content
 */
export function sanitizeText(dirty: string | undefined | null): string {
    if (!dirty) return "";
    // Remove all HTML tags
    const noTags = dirty.replace(/<[^>]*>/g, "");
    // Decode HTML entities and trim
    return decodeEntities(noTags).trim();
}

/**
 * Allowed tags for sanitizeHtml
 */
const ALLOWED_TAGS = ["b", "i", "em", "strong", "p", "br", "span"];

/**
 * Sanitizes HTML content while allowing basic formatting tags
 * Used for synopsis and rich text content
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
    if (!dirty) return "";

    // Create a pattern for allowed tags
    const allowedPattern = ALLOWED_TAGS.join("|");

    // Remove all tags except allowed ones (no attributes allowed)
    // First, strip attributes from allowed tags
    const withCleanTags = dirty.replace(
        new RegExp(`<(${allowedPattern})(\\s[^>]*)?>`, "gi"),
        "<$1>"
    );

    // Then remove all non-allowed tags
    const cleaned = withCleanTags.replace(
        new RegExp(`<(?!\\/?(${allowedPattern})\\s*>)[^>]+>`, "gi"),
        ""
    );

    return decodeEntities(cleaned).trim();
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
