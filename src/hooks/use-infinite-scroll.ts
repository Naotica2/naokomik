"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
    threshold?: number;
    initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
    items: T[];
    isLoading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => void;
    reset: () => void;
}

export function useInfiniteScroll<T>(
    fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
    options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
    const { threshold = 200, initialPage = 1 } = options;

    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn(page);
            setItems((prev) => [...prev, ...result.data]);
            setHasMore(result.hasMore);
            setPage((prev) => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to load more"));
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, page, isLoading, hasMore]);

    const reset = useCallback(() => {
        setItems([]);
        setPage(initialPage);
        setHasMore(true);
        setError(null);
    }, [initialPage]);

    useEffect(() => {
        // Load initial data
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { rootMargin: `${threshold}px` }
        );

        observerRef.current = observer;

        return () => {
            observer.disconnect();
        };
    }, [threshold, hasMore, isLoading, loadMore]);

    useEffect(() => {
        const observer = observerRef.current;
        const element = loadMoreRef.current;

        if (observer && element) {
            observer.observe(element);
            return () => observer.unobserve(element);
        }
    }, []);

    return {
        items,
        isLoading,
        error,
        hasMore,
        loadMore,
        reset,
    };
}
