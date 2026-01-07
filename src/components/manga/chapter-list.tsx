"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { getReadChapters } from "@/lib/read-chapters";
import type { Chapter } from "@/types/manga";

interface ChapterListProps {
    chapters: Chapter[];
    className?: string;
}

export function ChapterList({ chapters, className }: ChapterListProps) {
    const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load read chapters from localStorage on mount
    useEffect(() => {
        setReadChapters(getReadChapters());
        setIsLoaded(true);
    }, []);

    if (!chapters || chapters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="w-12 h-12 text-text-muted mb-4" />
                <p className="text-text-muted">Belum ada chapter tersedia</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {chapters.map((chapter, index) => {
                const isRead = isLoaded && readChapters.has(chapter.slug);

                return (
                    <motion.div
                        key={chapter.slug || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                        <Link
                            href={`/komik/read/${encodeURIComponent(chapter.slug)}`}
                            className={cn(
                                "flex items-center justify-between py-3 px-4",
                                "bg-surface hover:bg-surface-hover rounded-lg",
                                "border border-transparent hover:border-border",
                                "transition-all duration-200 group",
                                isRead && "opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {isRead ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <BookOpen className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                                )}
                                <span className={cn(
                                    "font-medium text-sm transition-colors",
                                    isRead
                                        ? "text-text-muted"
                                        : "text-text-primary group-hover:text-accent"
                                )}>
                                    {chapter.number}
                                </span>
                                {isRead && (
                                    <span className="text-xs text-green-500/80 font-medium">
                                        Dibaca
                                    </span>
                                )}
                            </div>

                            {chapter.release && (
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                    <Clock className="w-3 h-3" />
                                    <span>{chapter.release}</span>
                                </div>
                            )}
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
