"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { MangaGrid } from "@/components/manga/manga-grid";
import { SearchBar } from "@/components/search/search-bar";
import type { Manga } from "@/types/manga";

interface SearchResponse {
    data: Manga[];
    source: string;
    currentPage: number;
    nextPage: string | null;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        async function searchManga() {
            if (!query || query.trim().length < 2) {
                setResults([]);
                setSearched(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setSearched(true);

                const response = await fetch(
                    `/api/manga/search?q=${encodeURIComponent(query)}`
                );

                if (!response.ok) {
                    throw new Error("Gagal mencari manga");
                }

                const data: SearchResponse = await response.json();
                setResults(data.data || []);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Terjadi kesalahan saat mencari"
                );
            } finally {
                setLoading(false);
            }
        }

        searchManga();
    }, [query]);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-gradient-to-b from-accent/5 to-transparent py-12">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-xl bg-accent/10">
                                <Search className="w-8 h-8 text-accent" />
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                            Cari Manga
                        </h1>
                        <div className="max-w-lg mx-auto">
                            <SearchBar
                                className="w-full"
                                placeholder="Ketik judul manga..."
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Results */}
            <div className="container-custom py-8">
                {/* Search Query Display */}
                {query && searched && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-text-muted mb-6"
                    >
                        Hasil pencarian untuk:{" "}
                        <span className="text-text-primary font-medium">
                            &quot;{query}&quot;
                        </span>
                    </motion.p>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <p className="text-text-muted mt-4">Mencari manga...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && searched && results.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <Search className="w-16 h-16 text-text-muted mb-4" />
                        <h3 className="text-xl font-semibold text-text-primary">
                            Tidak ada hasil
                        </h3>
                        <p className="text-text-muted mt-2 max-w-md">
                            Coba kata kunci berbeda atau periksa ejaan Anda.
                        </p>
                    </motion.div>
                )}

                {/* Initial State */}
                {!loading && !searched && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <Search className="w-16 h-16 text-text-muted mb-4" />
                        <h3 className="text-xl font-semibold text-text-primary">
                            Mulai Mencari
                        </h3>
                        <p className="text-text-muted mt-2 max-w-md">
                            Ketik judul manga di kotak pencarian di atas.
                        </p>
                    </motion.div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <MangaGrid manga={results} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" />
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
