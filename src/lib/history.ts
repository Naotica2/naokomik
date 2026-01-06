"use client";

// ============================================
// Reading History Management with localStorage
// ============================================

export interface HistoryItem {
    slug: string;           // manga slug
    title: string;          // manga title
    thumbnail: string;      // cover image
    chapterSlug: string;    // last read chapter slug
    chapterNumber: string;  // chapter number display
    lastRead: number;       // timestamp
}

const HISTORY_KEY = "naokomik_reading_history";
const MAX_HISTORY_ITEMS = 50;

/**
 * Get all reading history
 */
export function getHistory(): HistoryItem[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (!stored) return [];

        const history: HistoryItem[] = JSON.parse(stored);
        // Sort by lastRead descending (most recent first)
        return history.sort((a, b) => b.lastRead - a.lastRead);
    } catch (error) {
        console.error("Error reading history:", error);
        return [];
    }
}

/**
 * Add or update reading history
 */
export function addToHistory(item: Omit<HistoryItem, "lastRead">): void {
    if (typeof window === "undefined") return;

    try {
        const history = getHistory();

        // Remove existing entry for this manga if exists
        const filteredHistory = history.filter(h => h.slug !== item.slug);

        // Add new entry at the beginning
        const newItem: HistoryItem = {
            ...item,
            lastRead: Date.now(),
        };

        filteredHistory.unshift(newItem);

        // Limit history size
        const trimmedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error("Error saving history:", error);
    }
}

/**
 * Remove a manga from history
 */
export function removeFromHistory(slug: string): void {
    if (typeof window === "undefined") return;

    try {
        const history = getHistory();
        const filteredHistory = history.filter(h => h.slug !== slug);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
        console.error("Error removing from history:", error);
    }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Error clearing history:", error);
    }
}

/**
 * Check if a manga is in history
 */
export function isInHistory(slug: string): boolean {
    const history = getHistory();
    return history.some(h => h.slug === slug);
}

/**
 * Get the last read chapter for a manga
 */
export function getLastReadChapter(slug: string): HistoryItem | undefined {
    const history = getHistory();
    return history.find(h => h.slug === slug);
}
