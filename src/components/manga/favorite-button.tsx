"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/auth-context";
import { getSupabaseClient } from "@/lib/supabase";

interface FavoriteButtonProps {
    comicSlug: string;
    comicTitle: string;
    comicCover?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
};

const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

export function FavoriteButton({
    comicSlug,
    comicTitle,
    comicCover,
    size = "md",
    className,
}: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        async function checkFavorite() {
            if (!user) return;

            const supabase = getSupabaseClient();
            const { data } = await supabase
                .from("favorite_comics")
                .select("id")
                .eq("user_id", user.id)
                .eq("comic_slug", comicSlug)
                .single();

            setIsFavorite(!!data);
        }

        checkFavorite();
    }, [user, comicSlug]);

    const toggleFavorite = async () => {
        if (!user) {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000);
            return;
        }

        setIsLoading(true);
        const supabase = getSupabaseClient();

        if (isFavorite) {
            // Remove from favorites
            await supabase
                .from("favorite_comics")
                .delete()
                .eq("user_id", user.id)
                .eq("comic_slug", comicSlug);

            setIsFavorite(false);
        } else {
            // Add to favorites
            await supabase.from("favorite_comics").insert({
                user_id: user.id,
                comic_slug: comicSlug,
                comic_title: comicTitle,
                comic_cover: comicCover || null,
            });

            setIsFavorite(true);
        }

        setIsLoading(false);
    };

    return (
        <div className="relative">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                disabled={isLoading}
                className={cn(
                    "rounded-full transition-all duration-200",
                    "hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    sizeClasses[size],
                    className
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <motion.div
                    animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                >
                    <Heart
                        className={cn(
                            iconSizes[size],
                            "transition-colors duration-200",
                            isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-text-secondary hover:text-red-400"
                        )}
                    />
                </motion.div>
            </motion.button>

            {/* Tooltip for non-logged-in users */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-full mt-2 px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-secondary whitespace-nowrap z-10"
                    >
                        Login to add favorites
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
