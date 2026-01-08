"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface RankBadgeProps {
    name: string;
    displayName: string;
    gradientFrom: string;
    gradientTo: string;
    glowColor: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
};

export function RankBadge({
    name,
    displayName,
    gradientFrom,
    gradientTo,
    glowColor,
    size = "md",
    className,
}: RankBadgeProps) {
    const isUnemployment = name === "unemployment";
    const isHacker = name === "hacker";

    return (
        <motion.span
            className={cn(
                "inline-flex items-center font-bold rounded-md",
                "border border-white/20",
                "select-none cursor-default",
                sizeClasses[size],
                className
            )}
            style={{
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: `0 0 12px ${glowColor}`,
            }}
            animate={
                isUnemployment
                    ? {
                        boxShadow: [
                            `0 0 12px ${glowColor}`,
                            `0 0 20px ${glowColor}`,
                            `0 0 12px ${glowColor}`,
                        ],
                    }
                    : isHacker
                        ? {
                            scale: [1, 1.02, 1],
                        }
                        : undefined
            }
            transition={
                isUnemployment || isHacker
                    ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }
                    : undefined
            }
        >
            <span
                className="relative"
                style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
            >
                {displayName}
            </span>
            {isUnemployment && (
                <motion.span
                    className="absolute inset-0 rounded-md overflow-hidden pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    }}
                    animate={{
                        x: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            )}
        </motion.span>
    );
}

// Preset badges for easy use
export function NewbieBadge({
    size,
    className,
}: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    return (
        <RankBadge
            name="newbie"
            displayName="NEWBIE"
            gradientFrom="#10b981"
            gradientTo="#059669"
            glowColor="rgba(16, 185, 129, 0.4)"
            size={size}
            className={className}
        />
    );
}

export function ProBadge({
    size,
    className,
}: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    return (
        <RankBadge
            name="pro"
            displayName="PRO"
            gradientFrom="#8b5cf6"
            gradientTo="#7c3aed"
            glowColor="rgba(139, 92, 246, 0.5)"
            size={size}
            className={className}
        />
    );
}

export function HackerBadge({
    size,
    className,
}: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    return (
        <RankBadge
            name="hacker"
            displayName="HACKER"
            gradientFrom="#ef4444"
            gradientTo="#dc2626"
            glowColor="rgba(239, 68, 68, 0.5)"
            size={size}
            className={className}
        />
    );
}

export function UnemploymentBadge({
    size,
    className,
}: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    return (
        <RankBadge
            name="unemployment"
            displayName="UNEMPLOYMENT"
            gradientFrom="#f59e0b"
            gradientTo="#d97706"
            glowColor="rgba(245, 158, 11, 0.5)"
            size={size}
            className={className}
        />
    );
}

// Dynamic badge based on level data
export function DynamicRankBadge({
    level,
    size,
    className,
}: {
    level: {
        name: string;
        display_name: string;
        gradient_from: string;
        gradient_to: string;
        glow_color: string;
    };
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    return (
        <RankBadge
            name={level.name}
            displayName={level.display_name}
            gradientFrom={level.gradient_from}
            gradientTo={level.gradient_to}
            glowColor={level.glow_color}
            size={size}
            className={className}
        />
    );
}
