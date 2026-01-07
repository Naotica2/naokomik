"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { History, BookOpen, X, Trash2, Clock, ArrowLeft, User, ChevronRight } from "lucide-react";
import { getHistory, removeFromHistory, clearHistory, type HistoryItem } from "@/lib/history";
import { cn } from "@/lib/cn";

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setHistory(getHistory());
        setIsLoaded(true);
    }, []);

    const handleRemove = (slug: string) => {
        removeFromHistory(slug);
        setHistory(getHistory());
    };

    const handleClearAll = () => {
        if (confirm("Hapus semua riwayat baca?")) {
            clearHistory();
            setHistory([]);
        }
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Baru saja";
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        return new Date(timestamp).toLocaleDateString("id-ID");
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-gradient-to-b from-accent/5 to-transparent py-12">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-accent/10">
                                <History className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                                    Riwayat Baca
                                </h1>
                                <p className="text-text-muted mt-1">
                                    {isLoaded ? `${history.length} komik` : "Memuat..."}
                                </p>
                            </div>
                        </div>

                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 text-sm text-text-muted hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Hapus Semua</span>
                            </button>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="container-custom py-8">
                {!isLoaded ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-28 rounded-lg skeleton" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="p-4 rounded-xl bg-surface mb-4">
                            <BookOpen className="w-12 h-12 text-text-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                            Belum ada riwayat baca
                        </h2>
                        <p className="text-text-muted max-w-md mb-6">
                            Mulai baca komik dan riwayat bacamu akan muncul di sini.
                        </p>
                        <Link href="/komik" className="btn-primary">
                            <ArrowLeft className="w-4 h-4" />
                            Jelajahi Komik
                        </Link>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((item, index) => (
                                <motion.div
                                    key={item.slug}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group relative"
                                >
                                    <div
                                        className={cn(
                                            "flex gap-4 p-4 rounded-xl",
                                            "bg-surface hover:bg-surface-hover",
                                            "border border-border hover:border-accent/50",
                                            "transition-all duration-200"
                                        )}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-16 h-[85px] flex-shrink-0 rounded-lg overflow-hidden">
                                            <Image
                                                src={item.thumbnail}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-text-primary line-clamp-2 text-sm mb-1">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-accent mb-2">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>{item.chapterNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{formatTime(item.lastRead)}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/komik/read/${encodeURIComponent(item.chapterSlug)}`}
                                                    className={cn(
                                                        "flex items-center gap-1.5",
                                                        "px-3 py-1.5 rounded-lg",
                                                        "bg-accent hover:bg-accent-hover",
                                                        "text-white text-xs font-medium",
                                                        "transition-colors"
                                                    )}
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    <span>Lanjut Baca</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Link>
                                                <Link
                                                    href={`/komik/${encodeURIComponent(item.slug)}`}
                                                    className={cn(
                                                        "flex items-center gap-1.5",
                                                        "px-3 py-1.5 rounded-lg",
                                                        "bg-surface-hover hover:bg-border",
                                                        "text-text-secondary text-xs font-medium",
                                                        "transition-colors border border-border"
                                                    )}
                                                >
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>Profil</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemove(item.slug);
                                        }}
                                        className={cn(
                                            "absolute top-2 right-2 p-1.5 rounded-lg",
                                            "bg-surface hover:bg-red-500 hover:text-white",
                                            "text-text-muted",
                                            "opacity-0 group-hover:opacity-100",
                                            "transition-all duration-200"
                                        )}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
