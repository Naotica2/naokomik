"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Library, ChevronLeft, ChevronRight } from "lucide-react";
import { MangaGrid } from "@/components/manga/manga-grid";
import type { Manga } from "@/types/manga";

interface MangaResponse {
    data: Manga[];
    source: string;
    currentPage: number;
    nextPage: string | null;
    prevPage: string | null;
}

export default function LibraryPage() {
    const [manga, setManga] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const fetchManga = useCallback(async (page: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/manga?tag=hot&page=${page}`);

            if (!response.ok) {
                throw new Error("Failed to fetch manga");
            }

            const data: MangaResponse = await response.json();

            if (data.data && data.data.length > 0) {
                setManga(data.data);
                setHasNextPage(!!data.nextPage);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Terjadi kesalahan"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchManga(currentPage);
    }, [currentPage, fetchManga]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-gradient-to-b from-accent/5 to-transparent py-12">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="p-3 rounded-xl bg-accent/10">
                            <Library className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                                Library Komik
                            </h1>
                            <p className="text-text-muted mt-1">
                                Jelajahi koleksi komik, manhwa, dan manhua
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="container-custom py-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center mb-6"
                    >
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => fetchManga(currentPage)}
                            className="mt-2 text-sm text-red-300 underline hover:no-underline"
                        >
                            Coba lagi
                        </button>
                    </motion.div>
                )}

                {loading ? (
                    <div className="manga-grid">
                        {[...Array(18)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] rounded-lg skeleton"
                            />
                        ))}
                    </div>
                ) : (
                    <MangaGrid manga={manga} priorityCount={12} />
                )}

                {/* Pagination */}
                {!loading && manga.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-4 mt-10"
                    >
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>

                        <span className="text-text-secondary font-medium">
                            Halaman {currentPage}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={!hasNextPage}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
