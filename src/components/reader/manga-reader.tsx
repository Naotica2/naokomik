"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    X,
    Home,
    List,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChapterContent } from "@/types/manga";

interface MangaReaderProps {
    chapterData: ChapterContent;
    chapterSlug: string;
}

export function MangaReader({ chapterData, chapterSlug }: MangaReaderProps) {
    const [showControls, setShowControls] = useState(true);
    const [showNav, setShowNav] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { images, title, prevChapter, nextChapter } = chapterData;

    // Hide controls after inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const hideControls = () => {
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        const showControlsHandler = () => {
            setShowControls(true);
            clearTimeout(timeout);
            hideControls();
        };

        hideControls();
        window.addEventListener("mousemove", showControlsHandler);
        window.addEventListener("touchstart", showControlsHandler);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", showControlsHandler);
            window.removeEventListener("touchstart", showControlsHandler);
        };
    }, []);

    // Track current image based on scroll position
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = imageRefs.current.findIndex(
                            (ref) => ref === entry.target
                        );
                        if (index !== -1) {
                            setCurrentImage(index);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        imageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [images]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && prevChapter) {
                window.location.href = `/manga/read/${encodeURIComponent(prevChapter)}`;
            } else if (e.key === "ArrowRight" && nextChapter) {
                window.location.href = `/manga/read/${encodeURIComponent(nextChapter)}`;
            }
        };

        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, [prevChapter, nextChapter]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleImageLoad = useCallback((index: number) => {
        setLoadedImages((prev) => new Set(prev).add(index));
    }, []);

    if (!images || images.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-text-muted">Tidak ada gambar tersedia</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen bg-black select-none"
        >
            {/* Top Bar */}
            <AnimatePresence>
                {showControls && (
                    <motion.header
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
                    >
                        <div className="container-custom flex items-center justify-between h-14">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/"
                                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                                >
                                    <Home className="w-5 h-5" />
                                </Link>
                                <div className="h-5 w-px bg-border" />
                                <span className="text-sm font-medium text-text-primary line-clamp-1 max-w-[200px] md:max-w-md">
                                    {title || chapterSlug}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted">
                                    {currentImage + 1} / {images.length}
                                </span>
                                <button
                                    onClick={() => setShowNav(!showNav)}
                                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                                >
                                    {showNav ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <List className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Image List Panel */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className="fixed right-0 top-14 bottom-0 w-72 z-40 glass border-l border-border/30 overflow-y-auto"
                    >
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">
                                Halaman
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            imageRefs.current[
                                                index
                                            ]?.scrollIntoView({
                                                behavior: "smooth",
                                            });
                                            setShowNav(false);
                                        }}
                                        className={cn(
                                            "aspect-square rounded-lg text-xs font-medium transition-all",
                                            currentImage === index
                                                ? "bg-accent text-white"
                                                : "bg-surface hover:bg-surface-hover text-text-secondary"
                                        )}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Images */}
            <div className="reader-container py-14">
                {images.map((imageUrl, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            imageRefs.current[index] = el;
                        }}
                        className="relative w-full"
                    >
                        {!loadedImages.has(index) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface min-h-[300px]">
                                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            </div>
                        )}
                        <Image
                            src={imageUrl}
                            alt={`Page ${index + 1}`}
                            width={1200}
                            height={1800}
                            className={cn(
                                "w-full h-auto reader-image transition-opacity duration-300",
                                loadedImages.has(index)
                                    ? "opacity-100"
                                    : "opacity-0"
                            )}
                            priority={index < 3}
                            onLoad={() => handleImageLoad(index)}
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {/* Bottom Navigation */}
            <AnimatePresence>
                {showControls && (
                    <motion.nav
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30"
                    >
                        <div className="container-custom flex items-center justify-between h-14">
                            {/* Prev Chapter */}
                            {prevChapter ? (
                                <Link
                                    href={`/manga/read/${encodeURIComponent(prevChapter)}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">
                                        Chapter Sebelumnya
                                    </span>
                                </Link>
                            ) : (
                                <div />
                            )}

                            {/* Scroll to Top */}
                            <button
                                onClick={scrollToTop}
                                className="p-2.5 bg-accent hover:bg-accent-hover rounded-full transition-colors"
                            >
                                <ArrowUp className="w-5 h-5 text-white" />
                            </button>

                            {/* Next Chapter */}
                            {nextChapter ? (
                                <Link
                                    href={`/manga/read/${encodeURIComponent(nextChapter)}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                                >
                                    <span className="hidden sm:inline">
                                        Chapter Selanjutnya
                                    </span>
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <div />
                            )}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
}
