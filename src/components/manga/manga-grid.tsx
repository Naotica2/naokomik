"use client";

import { motion } from "framer-motion";
import { MangaCard } from "./manga-card";
import { cn } from "@/lib/cn";
import type { Manga } from "@/types/manga";

interface MangaGridProps {
    manga: Manga[];
    className?: string;
    priorityCount?: number;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function MangaGrid({
    manga,
    className,
    priorityCount = 6,
}: MangaGridProps) {
    if (!manga || manga.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-text-muted text-lg">Tidak ada manga ditemukan</p>
            </div>
        );
    }

    return (
        <motion.div
            className={cn("manga-grid", className)}
            variants={container}
            initial="hidden"
            animate="show"
        >
            {manga.map((m, index) => (
                <motion.div key={m.slug || index} variants={item}>
                    <MangaCard manga={m} priority={index < priorityCount} />
                </motion.div>
            ))}
        </motion.div>
    );
}
