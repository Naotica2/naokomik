"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Manga } from "@/types/manga";

interface FeaturedCarouselProps {
    manga: Manga[];
    className?: string;
    autoPlayInterval?: number;
}

export function FeaturedCarousel({
    manga,
    className,
    autoPlayInterval = 5000,
}: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const featuredManga = manga.slice(0, 5);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredManga.length);
    }, [featuredManga.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex(
            (prev) => (prev - 1 + featuredManga.length) % featuredManga.length
        );
    }, [featuredManga.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying || featuredManga.length <= 1) return;

        const interval = setInterval(goToNext, autoPlayInterval);
        return () => clearInterval(interval);
    }, [isAutoPlaying, goToNext, autoPlayInterval, featuredManga.length]);

    // Resume auto-play after user interaction
    useEffect(() => {
        if (!isAutoPlaying) {
            const timeout = setTimeout(() => setIsAutoPlaying(true), 10000);
            return () => clearTimeout(timeout);
        }
    }, [isAutoPlaying]);

    if (featuredManga.length === 0) return null;

    const current = featuredManga[currentIndex];

    return (
        <div
            className={cn(
                "relative w-full aspect-[21/9] md:aspect-[3/1] rounded-xl overflow-hidden group",
                className
            )}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    {current.thumbnail && (
                        <Image
                            src={current.thumbnail}
                            alt={current.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="max-w-2xl space-y-3"
                    >
                        {/* Type Badge */}
                        {current.type && (
                            <span className="badge-accent text-xs uppercase tracking-wider">
                                {current.type}
                            </span>
                        )}

                        {/* Title */}
                        <h2 className="text-2xl md:text-4xl font-bold text-white line-clamp-2">
                            {current.title}
                        </h2>

                        {/* Description */}
                        {current.description && (
                            <p className="text-sm md:text-base text-white/80 line-clamp-2 md:line-clamp-3">
                                {current.description}
                            </p>
                        )}

                        {/* CTA Button */}
                        <Link
                            href={`/komik/${encodeURIComponent(current.slug)}`}
                            className="btn-primary w-fit mt-4"
                        >
                            <BookOpen className="w-4 h-4" />
                            Baca Sekarang
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {featuredManga.length > 1 && (
                <>
                    <button
                        onClick={goToPrev}
                        className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                            "bg-black/40 text-white/80 backdrop-blur-sm",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "hover:bg-black/60 hover:text-white"
                        )}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={goToNext}
                        className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                            "bg-black/40 text-white/80 backdrop-blur-sm",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "hover:bg-black/60 hover:text-white"
                        )}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dot Indicators */}
            {featuredManga.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {featuredManga.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "bg-accent w-6"
                                    : "bg-white/40 hover:bg-white/60"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
