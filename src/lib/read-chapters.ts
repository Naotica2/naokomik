"use client";

// ============================================
// Read Chapters Management with localStorage
// Stores list of chapters that have been read
// ============================================

const READ_CHAPTERS_KEY = "naokomik_read_chapters";

/**
 * Get all read chapter slugs
 */
export function getReadChapters(): Set<string> {
    if (typeof window === "undefined") return new Set();

    try {
        const stored = localStorage.getItem(READ_CHAPTERS_KEY);
        if (!stored) return new Set();

        const chapters: string[] = JSON.parse(stored);
        return new Set(chapters);
    } catch (error) {
        console.error("Error reading read chapters:", error);
        return new Set();
    }
}

/**
 * Add a chapter to the read list
 */
export function addReadChapter(chapterSlug: string): void {
    if (typeof window === "undefined") return;

    try {
        const readChapters = getReadChapters();
        readChapters.add(chapterSlug);

        localStorage.setItem(
            READ_CHAPTERS_KEY,
            JSON.stringify(Array.from(readChapters))
        );
    } catch (error) {
        console.error("Error saving read chapter:", error);
    }
}

/**
 * Check if a chapter has been read
 */
export function isChapterRead(chapterSlug: string): boolean {
    const readChapters = getReadChapters();
    return readChapters.has(chapterSlug);
}

/**
 * Clear all read chapter data
 */
export function clearReadChapters(): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(READ_CHAPTERS_KEY);
    } catch (error) {
        console.error("Error clearing read chapters:", error);
    }
}
