"use client";

import { cn } from "@/lib/cn";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "skeleton rounded-lg bg-surface animate-pulse",
                className
            )}
        />
    );
}

export function MangaCardSkeleton() {
    return (
        <div className="manga-card">
            <div className="relative aspect-[3/4] overflow-hidden">
                <Skeleton className="absolute inset-0" />
            </div>
            <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export function MangaGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="manga-grid">
            {Array.from({ length: count }).map((_, i) => (
                <MangaCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-xl overflow-hidden">
            <Skeleton className="absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
                <Skeleton className="h-8 w-2/3 md:w-1/3" />
                <Skeleton className="h-4 w-full md:w-1/2" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}

export function ChapterListSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between py-3 px-4 bg-surface rounded-lg"
                >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ))}
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Thumbnail */}
            <div className="mx-auto md:mx-0">
                <Skeleton className="w-[250px] aspect-[3/4] rounded-xl" />
            </div>

            {/* Info */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    );
}
