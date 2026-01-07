"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook untuk menyimpan state pagination di sessionStorage
 * - Ketika user kembali dari profil komik → halaman tetap di posisi terakhir
 * - Ketika user refresh atau keluar → halaman reset ke 1
 *
 * @param key - Unique key untuk menyimpan state (e.g., 'komik-page', 'latest-page')
 * @param initialValue - Nilai default halaman (biasanya 1)
 */
export function usePaginationState(
    key: string,
    initialValue: number = 1
): [number, (value: number | ((prev: number) => number)) => void, boolean] {
    // Start dengan initialValue untuk menghindari hydration mismatch
    const [page, setPage] = useState<number>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Baca dari sessionStorage setelah mount (client-side only)
    useEffect(() => {
        try {
            const storedValue = window.sessionStorage.getItem(key);
            if (storedValue) {
                const parsedValue = parseInt(storedValue, 10);
                if (!isNaN(parsedValue) && parsedValue > 0) {
                    setPage(parsedValue);
                }
            }
        } catch {
            // Ignore storage errors
        }
        setIsHydrated(true);
    }, [key]);

    // Simpan ke sessionStorage ketika page berubah (setelah hydrated)
    useEffect(() => {
        if (!isHydrated) return;

        try {
            window.sessionStorage.setItem(key, page.toString());
        } catch {
            // Ignore storage errors
        }
    }, [key, page, isHydrated]);

    // Wrapper untuk setPage
    const setPageWithStorage = useCallback(
        (value: number | ((prev: number) => number)) => {
            setPage((prevPage) => {
                const newPage = value instanceof Function ? value(prevPage) : value;
                return newPage;
            });
        },
        []
    );

    return [page, setPageWithStorage, isHydrated];
}
