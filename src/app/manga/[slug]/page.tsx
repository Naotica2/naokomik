"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    BookOpen,
    Star,
    User,
    Clock,
    Tag,
    Loader2,
    AlertCircle,
    Play
} from "lucide-react";
import { ChapterList } from "@/components/manga/chapter-list";
import type { MangaDetail } from "@/types/manga";

export default function MangaDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [manga, setManga] = useState<MangaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMangaDetail() {
            if (!slug) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/manga/${encodeURIComponent(slug)}`
                );

                if (!response.ok) {
                    throw new Error("Manga tidak ditemukan");
                }

                const data = await response.json();
                setManga(data.data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Gagal memuat detail manga"
                );
                console.error("Error fetching manga detail:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchMangaDetail();
    }, [slug]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    <p className="text-text-muted">Memuat manga...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !manga) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-4">
                    <AlertCircle className="w-16 h-16 text-red-400" />
                    <h1 className="text-2xl font-bold text-text-primary">
                        {error || "Manga tidak ditemukan"}
                    </h1>
                    <p className="text-text-muted max-w-md">
                        Maaf, manga yang Anda cari tidak dapat ditemukan atau
                        terjadi kesalahan.
                    </p>
                    <Link href="/" className="btn-primary mt-4">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    const firstChapter = manga.chapters?.[manga.chapters.length - 1];
    const latestChapter = manga.chapters?.[0];

    return (
        <div className="min-h-screen">
            {/* Hero Section with Background */}
            <div className="relative h-[300px] md:h-[400px]">
                {/* Background Image */}
                {manga.thumbnail && (
                    <Image
                        src={manga.thumbnail}
                        alt={manga.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

                {/* Back Button */}
                <div className="absolute top-4 left-4 z-10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Kembali</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="container-custom -mt-32 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-shrink-0"
                    >
                        <div className="relative w-[180px] md:w-[220px] aspect-[3/4] mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl border border-border">
                            {manga.thumbnail && (
                                <Image
                                    src={manga.thumbnail}
                                    alt={manga.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 space-y-4"
                    >
                        {/* Type Badge */}
                        {manga.type && (
                            <span className="badge-accent uppercase text-xs tracking-wider">
                                {manga.type}
                            </span>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl md:text-4xl font-bold text-text-primary">
                            {manga.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            {manga.author && (
                                <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    <span>{manga.author}</span>
                                </div>
                            )}
                            {manga.status && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>{manga.status}</span>
                                </div>
                            )}
                            {manga.rating && (
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{manga.rating}</span>
                                </div>
                            )}
                        </div>

                        {/* Genres */}
                        {manga.genres && manga.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {manga.genres.map((genre, index) => (
                                    <span
                                        key={index}
                                        className="badge-type text-xs"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {firstChapter && (
                                <Link
                                    href={`/manga/read/${encodeURIComponent(firstChapter.slug)}`}
                                    className="btn-primary"
                                >
                                    <Play className="w-4 h-4" />
                                    Mulai Baca
                                </Link>
                            )}
                            {latestChapter && (
                                <Link
                                    href={`/manga/read/${encodeURIComponent(latestChapter.slug)}`}
                                    className="btn-secondary"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Chapter Terbaru
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Synopsis & Chapters */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                    {/* Synopsis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-accent" />
                                Sinopsis
                            </h2>
                            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                                {manga.synopsis || "Sinopsis tidak tersedia."}
                            </p>
                        </div>
                    </motion.div>

                    {/* Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-text-primary">
                                Informasi
                            </h2>
                            <div className="space-y-3 text-sm">
                                <InfoRow label="Status" value={manga.status} />
                                <InfoRow label="Tipe" value={manga.type} />
                                <InfoRow label="Author" value={manga.author} />
                                <InfoRow label="Rating" value={manga.rating} />
                                <InfoRow
                                    label="Total Chapter"
                                    value={`${manga.chapters?.length || 0} Chapter`}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Chapter List */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 mb-10"
                >
                    <div className="section-header">
                        <h2 className="section-title flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-accent" />
                            Daftar Chapter
                        </h2>
                        <span className="text-sm text-text-muted">
                            {manga.chapters?.length || 0} Chapter
                        </span>
                    </div>

                    <div className="card p-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                        <ChapterList
                            chapters={manga.chapters || []}
                        />
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

// Info Row Component
function InfoRow({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    if (!value) return null;

    return (
        <div className="flex justify-between items-center">
            <span className="text-text-muted">{label}</span>
            <span className="text-text-primary font-medium">{value}</span>
        </div>
    );
}
