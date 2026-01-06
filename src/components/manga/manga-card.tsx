"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Manga } from "@/types/manga";

interface MangaCardProps {
    manga: Manga;
    priority?: boolean;
    className?: string;
}

export function MangaCard({ manga, priority = false, className }: MangaCardProps) {
    return (
        <Link href={`/komik/${encodeURIComponent(manga.slug)}`}>
            <motion.article
                className={cn("manga-card group", className)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-elevated">
                    {manga.thumbnail ? (
                        <Image
                            src={manga.thumbnail}
                            alt={manga.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority={priority}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
                            <span className="text-text-muted text-sm">No Image</span>
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Type badge */}
                    {manga.type && (
                        <span className="absolute top-2 left-2 badge-type text-[10px] uppercase tracking-wide">
                            {manga.type}
                        </span>
                    )}

                    {/* Rating badge */}
                    {manga.rating && (
                        <span className="absolute top-2 right-2 badge-accent flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {manga.rating}
                        </span>
                    )}

                    {/* Latest chapter */}
                    {manga.latestChapter && (
                        <span className="absolute bottom-2 left-2 right-2 text-[11px] text-white/90 bg-black/60 backdrop-blur-sm px-2 py-1 rounded truncate">
                            {manga.latestChapter}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                    <h3 className="font-medium text-sm text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                        {manga.title}
                    </h3>
                    {manga.description && (
                        <p className="text-xs text-text-muted line-clamp-2">
                            {manga.description}
                        </p>
                    )}
                    {manga.updateTime && (
                        <p className="text-xs text-text-muted">{manga.updateTime}</p>
                    )}
                </div>
            </motion.article>
        </Link>
    );
}
