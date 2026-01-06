"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { MangaReader } from "@/components/reader/manga-reader";
import type { ChapterContent } from "@/types/manga";

interface ChapterResponse {
    data: ChapterContent;
    source: string;
}

export default function ReaderPage() {
    const params = useParams();
    const slug = params.chapter as string;
    const [chapterData, setChapterData] = useState<ChapterContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchChapter() {
            if (!slug) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/manga/chapter/${encodeURIComponent(slug)}`
                );

                if (!response.ok) {
                    throw new Error("Chapter tidak ditemukan");
                }

                const data: ChapterResponse = await response.json();
                setChapterData(data.data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Gagal memuat chapter"
                );
                console.error("Error fetching chapter:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchChapter();
    }, [slug]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    <p className="text-text-muted">Memuat chapter...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !chapterData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center px-4">
                    <AlertCircle className="w-16 h-16 text-red-400" />
                    <h1 className="text-2xl font-bold text-text-primary">
                        {error || "Chapter tidak ditemukan"}
                    </h1>
                    <p className="text-text-muted max-w-md">
                        Maaf, chapter yang Anda cari tidak dapat ditemukan atau
                        terjadi kesalahan saat memuat gambar.
                    </p>
                    <Link href="/" className="btn-primary mt-4">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return <MangaReader chapterData={chapterData} chapterSlug={slug} />;
}
