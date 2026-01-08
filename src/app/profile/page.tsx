"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    User,
    Edit,
    Heart,
    Clock,
    LogOut,
    Shield,
    BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { DynamicRankBadge } from "@/components/user/rank-badge";
import { getSupabaseClient } from "@/lib/supabase";
import { FavoriteComic, ReadingHistory } from "@/types/database";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, isAdmin, signOut } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteComic[]>([]);
    const [history, setHistory] = useState<ReadingHistory[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        async function fetchUserData() {
            if (!user) return;

            const supabase = getSupabaseClient();

            // Fetch favorites
            const { data: favoritesData } = await supabase
                .from("favorite_comics")
                .select("*")
                .eq("user_id", user.id)
                .order("added_at", { ascending: false })
                .limit(6);

            if (favoritesData) setFavorites(favoritesData);

            // Fetch reading history
            const { data: historyData } = await supabase
                .from("reading_history")
                .select("*")
                .eq("user_id", user.id)
                .order("read_at", { ascending: false })
                .limit(6);

            if (historyData) setHistory(historyData);

            setLoadingData(false);
        }

        if (user) {
            fetchUserData();
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 md:p-8"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-surface border-4 border-accent/20">
                            {user.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt={user.username}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-purple-600">
                                    <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            {user.user_levels && (
                                <DynamicRankBadge level={user.user_levels} size="md" />
                            )}
                            {isAdmin && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                                    ADMIN
                                </span>
                            )}
                        </div>

                        <p className="text-text-secondary mb-4 max-w-md">
                            {user.bio || "No bio yet. Edit your profile to add one!"}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <Link
                                href="/profile/edit"
                                className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Link>

                            {isAdmin && (
                                <Link
                                    href="/naokomikadminasli"
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                >
                                    <Shield className="w-4 h-4" />
                                    Admin Dashboard
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover text-text-secondary rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="w-full md:w-auto min-w-[200px]">
                        <LevelProgress
                            currentPoints={user.points}
                            currentLevel={user.user_levels}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Favorites Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Favorite Comics
                    </h2>
                </div>

                {loadingData ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[2/3] rounded-lg bg-surface animate-pulse"
                            />
                        ))}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {favorites.map((fav) => (
                            <Link
                                key={fav.id}
                                href={`/komik/${fav.comic_slug}`}
                                className="group"
                            >
                                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface relative">
                                    {fav.comic_cover ? (
                                        <Image
                                            src={fav.comic_cover}
                                            alt={fav.comic_title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-8 h-8 text-text-secondary" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="mt-2 text-sm font-medium line-clamp-2">
                                    {fav.comic_title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-secondary">
                        <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No favorites yet. Start adding comics you love!</p>
                    </div>
                )}
            </motion.section>

            {/* Reading History Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        Recently Read
                    </h2>
                </div>

                {loadingData ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-20 rounded-lg bg-surface animate-pulse"
                            />
                        ))}
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <Link
                                key={item.id}
                                href={item.chapter_url || `/komik/${item.comic_slug}`}
                                className="flex items-center gap-4 p-4 glass rounded-lg hover:bg-surface-hover transition-colors"
                            >
                                <div className="w-12 h-16 rounded overflow-hidden bg-surface flex-shrink-0">
                                    {item.comic_cover ? (
                                        <Image
                                            src={item.comic_cover}
                                            alt={item.comic_title}
                                            width={48}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-text-secondary" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{item.comic_title}</h3>
                                    <p className="text-sm text-text-secondary">
                                        {item.last_chapter || "View comic"}
                                    </p>
                                </div>
                                <div className="text-xs text-text-secondary">
                                    {new Date(item.read_at).toLocaleDateString("id-ID")}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-secondary">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No reading history yet. Start reading some comics!</p>
                    </div>
                )}
            </motion.section>
        </div>
    );
}

// Level thresholds (must match database)
const LEVEL_THRESHOLDS = [
    { name: "newbie", minPoints: 0 },
    { name: "pro", minPoints: 500 },
    { name: "hacker", minPoints: 2000 },
    { name: "unemployment", minPoints: 5000 },
];

function LevelProgress({
    currentPoints,
    currentLevel,
}: {
    currentPoints: number;
    currentLevel?: { name: string; display_name: string } | null;
}) {
    // Find current and next level
    const currentLevelIdx = LEVEL_THRESHOLDS.findIndex(
        (l) => l.name === currentLevel?.name
    );
    const nextLevel = LEVEL_THRESHOLDS[currentLevelIdx + 1];

    // Calculate progress
    const currentThreshold = LEVEL_THRESHOLDS[currentLevelIdx]?.minPoints || 0;
    const nextThreshold = nextLevel?.minPoints || currentThreshold;
    const pointsInLevel = currentPoints - currentThreshold;
    const pointsNeeded = nextThreshold - currentThreshold;
    const progress = nextLevel
        ? Math.min((pointsInLevel / pointsNeeded) * 100, 100)
        : 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                    {currentPoints.toLocaleString()} chapters read
                </span>
                {nextLevel && (
                    <span className="text-text-secondary">
                        {nextThreshold.toLocaleString()} for{" "}
                        <span className="font-medium text-accent">
                            {nextLevel.name.toUpperCase()}
                        </span>
                    </span>
                )}
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {!nextLevel && (
                <p className="text-xs text-center text-amber-400">
                    Max level reached! 🎉
                </p>
            )}
        </div>
    );
}
