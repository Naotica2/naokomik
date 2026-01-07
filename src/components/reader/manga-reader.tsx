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
    Maximize,
    Minimize,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { addToHistory } from "@/lib/history";
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFloatingNav, setShowFloatingNav] = useState(false);
    const [isImmersiveMode, setIsImmersiveMode] = useState(false);
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isInitialized, setIsInitialized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const floatingNavTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check if running on iOS (doesn't support Fullscreen API well)
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Constants for sessionStorage
    const FULLSCREEN_PREF_KEY = 'naokomik_fullscreen_preference';

    // Detect device type based on viewport
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setDeviceType('mobile');
            } else if (width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';

    const { images, title, prevChapter, nextChapter, mangaSlug, mangaTitle, mangaThumbnail, chapterNumber } = chapterData;

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

    // Fullscreen change detection & persistence
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isNowFullscreen);
            // Persist preference
            if (isNowFullscreen) {
                sessionStorage.setItem(FULLSCREEN_PREF_KEY, 'true');
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, [FULLSCREEN_PREF_KEY]);

    // Restore fullscreen preference on mount - always use immersive mode for auto-restore
    // Native fullscreen API cannot be called without user gesture
    useEffect(() => {
        const savedPref = sessionStorage.getItem(FULLSCREEN_PREF_KEY);
        if (savedPref === 'true' && !isInitialized) {
            setIsInitialized(true);
            // Always use immersive mode for auto-restore (no user gesture needed)
            setIsImmersiveMode(true);
            setIsFullscreen(true);
        } else {
            setIsInitialized(true);
        }
    }, [isInitialized, FULLSCREEN_PREF_KEY]);

    // Toggle fullscreen mode
    const toggleFullscreen = useCallback(async () => {
        try {
            // If already in immersive mode, toggle it off
            if (isImmersiveMode) {
                setIsImmersiveMode(false);
                setIsFullscreen(false);
                sessionStorage.removeItem(FULLSCREEN_PREF_KEY);
                return;
            }

            // For iOS or when Fullscreen API is not available, use immersive mode
            if (isIOS || !document.documentElement.requestFullscreen) {
                setIsImmersiveMode(true);
                setIsFullscreen(true);
                sessionStorage.setItem(FULLSCREEN_PREF_KEY, 'true');
                return;
            }

            // Native fullscreen toggle
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
                sessionStorage.setItem(FULLSCREEN_PREF_KEY, 'true');
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
                setIsImmersiveMode(false);
                sessionStorage.removeItem(FULLSCREEN_PREF_KEY);
            }
        } catch (err) {
            // Fallback to immersive mode if fullscreen fails
            console.error("Fullscreen error, using immersive mode:", err);
            const newState = !isImmersiveMode;
            setIsImmersiveMode(newState);
            setIsFullscreen(newState);
            if (newState) {
                sessionStorage.setItem(FULLSCREEN_PREF_KEY, 'true');
            } else {
                sessionStorage.removeItem(FULLSCREEN_PREF_KEY);
            }
        }
    }, [isIOS, isImmersiveMode, FULLSCREEN_PREF_KEY]);

    // Exit fullscreen
    const exitFullscreen = useCallback(async () => {
        try {
            // Always clear preference when exiting
            sessionStorage.removeItem(FULLSCREEN_PREF_KEY);

            if (isImmersiveMode) {
                setIsImmersiveMode(false);
                setIsFullscreen(false);
                return;
            }
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error("Exit fullscreen error:", err);
            setIsImmersiveMode(false);
            setIsFullscreen(false);
        }
    }, [isImmersiveMode, FULLSCREEN_PREF_KEY]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && prevChapter) {
                window.location.href = `/komik/read/${encodeURIComponent(prevChapter)}`;
            } else if (e.key === "ArrowRight" && nextChapter) {
                window.location.href = `/komik/read/${encodeURIComponent(nextChapter)}`;
            } else if (e.key === "f" || e.key === "F") {
                toggleFullscreen();
            } else if (e.key === "Escape" && isFullscreen) {
                exitFullscreen();
            }
        };

        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, [prevChapter, nextChapter, isFullscreen, exitFullscreen, toggleFullscreen]);

    // Show floating nav on mouse move in fullscreen
    const handleFullscreenMouseMove = useCallback(() => {
        if (!isFullscreen) return;

        setShowFloatingNav(true);

        if (floatingNavTimeoutRef.current) {
            clearTimeout(floatingNavTimeoutRef.current);
        }

        floatingNavTimeoutRef.current = setTimeout(() => {
            setShowFloatingNav(false);
        }, 2500);
    }, [isFullscreen]);

    // Cleanup floating nav timeout
    useEffect(() => {
        return () => {
            if (floatingNavTimeoutRef.current) {
                clearTimeout(floatingNavTimeoutRef.current);
            }
        };
    }, []);

    // Save to reading history when chapter loads
    useEffect(() => {
        if (mangaSlug && mangaTitle && chapterSlug && chapterNumber) {
            addToHistory({
                slug: mangaSlug,
                title: mangaTitle,
                thumbnail: mangaThumbnail || "/placeholder-manga.jpg",
                chapterSlug: chapterSlug,
                chapterNumber: chapterNumber,
            });
        }
    }, [mangaSlug, mangaTitle, mangaThumbnail, chapterSlug, chapterNumber]);

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
            className={cn(
                "relative min-h-screen bg-black select-none",
                (isFullscreen || isImmersiveMode) && "fullscreen-reader",
                isImmersiveMode && "immersive-mode"
            )}
            onMouseMove={handleFullscreenMouseMove}
            onTouchStart={handleFullscreenMouseMove}
        >
            {/* Top Bar - Hidden on mobile/tablet in fullscreen for clean reading */}
            <AnimatePresence>
                {showControls && !((isMobile || isTablet) && (isFullscreen || isImmersiveMode)) && (
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
                                    onClick={toggleFullscreen}
                                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                                    title={isFullscreen ? "Keluar Fullscreen (F)" : "Fullscreen (F)"}
                                >
                                    {isFullscreen ? (
                                        <Minimize className="w-5 h-5" />
                                    ) : (
                                        <Maximize className="w-5 h-5" />
                                    )}
                                </button>
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

            {/* Image List Panel - Hidden on mobile/tablet in fullscreen */}
            <AnimatePresence>
                {showNav && !((isMobile || isTablet) && (isFullscreen || isImmersiveMode)) && (
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
            <div className={`reader-container ${(isFullscreen || isImmersiveMode) && (isMobile || isTablet) ? 'py-0' : 'py-14'}`}>
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

                {/* End of Chapter Message */}
                {!nextChapter && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 px-4 text-center"
                    >
                        <div className="p-4 rounded-xl bg-accent/10 mb-4">
                            <ChevronRight className="w-8 h-8 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                            Ini adalah chapter terakhir
                        </h3>
                        <p className="text-text-muted text-sm mb-6 max-w-md">
                            Kamu sudah membaca hingga chapter terbaru. Nantikan update chapter selanjutnya!
                        </p>
                        <Link
                            href={mangaSlug ? `/komik/${encodeURIComponent(mangaSlug)}` : "/"}
                            className="btn-primary"
                        >
                            Kembali ke Detail Komik
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Bottom Navigation - Hidden on mobile/tablet in fullscreen for cleaner experience */}
            <AnimatePresence>
                {showControls && !((isMobile || isTablet) && (isFullscreen || isImmersiveMode)) && (
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
                                    href={`/komik/read/${encodeURIComponent(prevChapter)}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Prev</span>
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
                                    href={`/komik/read/${encodeURIComponent(nextChapter)}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <div />
                            )}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* Floating Fullscreen Navigation */}
            <AnimatePresence>
                {(isFullscreen || isImmersiveMode) && (showFloatingNav || showControls) && (
                    <>
                        {/* Desktop only: Side navigation */}
                        {!isMobile && !isTablet && (
                            <>
                                {/* Left side - Prev Chapter */}
                                {prevChapter && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
                                    >
                                        <Link
                                            href={`/komik/read/${encodeURIComponent(prevChapter)}`}
                                            className="flex flex-col items-center gap-2 p-4 rounded-xl glass border border-border/30 hover:bg-surface/90 transition-all group"
                                        >
                                            <ChevronLeft className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium text-text-secondary">Prev</span>
                                        </Link>
                                    </motion.div>
                                )}

                                {/* Right side - Next Chapter */}
                                {nextChapter && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
                                    >
                                        <Link
                                            href={`/komik/read/${encodeURIComponent(nextChapter)}`}
                                            className="flex flex-col items-center gap-2 p-4 rounded-xl glass border border-border/30 hover:bg-surface/90 transition-all group"
                                        >
                                            <ChevronRight className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium text-text-secondary">Next</span>
                                        </Link>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {/* Mobile & Tablet: Minimal bottom nav - only shows on tap */}
                        {(isMobile || isTablet) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb"
                            >
                                <div className={`flex items-center justify-between ${isTablet ? 'px-8 py-4' : 'px-4 py-3'} bg-black/80 backdrop-blur-sm`}>
                                    {/* Prev */}
                                    {prevChapter ? (
                                        <Link
                                            href={`/komik/read/${encodeURIComponent(prevChapter)}`}
                                            className={`flex items-center gap-1.5 ${isTablet ? 'px-4 py-2.5' : 'px-3 py-2'} rounded-lg bg-white/10 active:bg-white/20`}
                                        >
                                            <ChevronLeft className={isTablet ? 'w-5 h-5' : 'w-4 h-4'} />
                                            <span className={isTablet ? 'text-sm' : 'text-xs'}>Prev</span>
                                        </Link>
                                    ) : (
                                        <div className="w-16" />
                                    )}

                                    {/* Center: Page + Exit */}
                                    <div className="flex items-center gap-3">
                                        <span className={`${isTablet ? 'text-sm' : 'text-xs'} text-white/70`}>
                                            {currentImage + 1}/{images.length}
                                        </span>
                                        <button
                                            onClick={toggleFullscreen}
                                            className={`${isTablet ? 'p-2.5' : 'p-2'} rounded-lg bg-white/10 active:bg-white/20`}
                                        >
                                            <Minimize className={isTablet ? 'w-5 h-5' : 'w-4 h-4'} />
                                        </button>
                                        <button
                                            onClick={scrollToTop}
                                            className={`${isTablet ? 'p-2.5' : 'p-2'} rounded-lg bg-accent active:bg-accent-hover`}
                                        >
                                            <ArrowUp className={`${isTablet ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
                                        </button>
                                    </div>

                                    {/* Next */}
                                    {nextChapter ? (
                                        <Link
                                            href={`/komik/read/${encodeURIComponent(nextChapter)}`}
                                            className={`flex items-center gap-1.5 ${isTablet ? 'px-4 py-2.5' : 'px-3 py-2'} rounded-lg bg-accent active:bg-accent-hover`}
                                        >
                                            <span className={`${isTablet ? 'text-sm' : 'text-xs'} text-white`}>Next</span>
                                            <ChevronRight className={`${isTablet ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
                                        </Link>
                                    ) : (
                                        <div className="w-16" />
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Desktop only: Bottom center controls */}
                        {!isMobile && !isTablet && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3"
                            >
                                <div className="px-4 py-2 rounded-full glass border border-border/30">
                                    <span className="text-sm font-medium text-text-primary">
                                        {currentImage + 1} / {images.length}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-3 rounded-full glass border border-border/30 hover:bg-surface/90 transition-all"
                                    title="Keluar Fullscreen (F)"
                                >
                                    <Minimize className="w-5 h-5 text-accent" />
                                </button>
                                <button
                                    onClick={scrollToTop}
                                    className="p-3 rounded-full bg-accent hover:bg-accent-hover transition-all"
                                >
                                    <ArrowUp className="w-5 h-5 text-white" />
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
