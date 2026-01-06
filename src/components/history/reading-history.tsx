"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { History, BookOpen, X, ChevronRight } from "lucide-react";
import { getHistory, removeFromHistory, type HistoryItem } from "@/lib/history";
import { cn } from "@/lib/cn";

export function ReadingHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setHistory(getHistory());
        setIsLoaded(true);
    }, []);

    const handleRemove = (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromHistory(slug);
        setHistory(getHistory());
    };

    // Don't render until client-side loaded
    if (!isLoaded || history.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">
            <div className="section-header mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                        <History className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="section-title">Lanjutkan Membaca</h2>
                </div>
                <Link
                    href="/history"
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
                >
                    <span>Lihat Semua</span>
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                    <AnimatePresence mode="popLayout">
                        {history.slice(0, 5).map((item, index) => (
                            <motion.div
                                key={item.slug}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex-shrink-0"
                            >
                                <Link
                                    href={`/komik/read/${encodeURIComponent(item.chapterSlug)}`}
                                    className={cn(
                                        "block relative group",
                                        "w-[140px] sm:w-[160px]"
                                    )}
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => handleRemove(item.slug, e)}
                                        className={cn(
                                            "absolute top-2 right-2 z-20",
                                            "p-1.5 rounded-full",
                                            "bg-black/60 hover:bg-red-500",
                                            "opacity-0 group-hover:opacity-100",
                                            "transition-all duration-200",
                                            "text-white"
                                        )}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Thumbnail */}
                                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border group-hover:border-accent/50 transition-colors">
                                        <Image
                                            src={item.thumbnail}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="160px"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        {/* Continue Reading Badge */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <div className="flex items-center gap-1.5 text-white mb-1">
                                                <BookOpen className="w-3.5 h-3.5 text-accent" />
                                                <span className="text-xs font-medium text-accent">
                                                    {item.chapterNumber}
                                                </span>
                                            </div>
                                            <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Hover Continue Button */}
                                    <div className={cn(
                                        "absolute inset-0 flex items-center justify-center",
                                        "bg-black/60 rounded-lg",
                                        "opacity-0 group-hover:opacity-100",
                                        "transition-opacity duration-200"
                                    )}>
                                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                                            <span>Lanjutkan</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Scroll Fade (right side) */}
                {history.length > 5 && (
                    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                )}
            </div>
        </section>
    );
}
