"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Library, Search, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/latest", label: "Latest", icon: Clock },
    { href: "/manga", label: "Library", icon: Library },
    { href: "/search", label: "Search", icon: Search },
];

export function MobileNav() {
    const pathname = usePathname();

    // Don't show on reader page
    if (pathname.startsWith("/manga/read")) {
        return null;
    }

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "md:hidden",
                "bg-surface/95 backdrop-blur-xl",
                "border-t border-border/50",
                "safe-area-bottom"
            )}
        >
            <div className="flex items-center justify-around py-2 px-4">
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 py-2 px-4 rounded-xl",
                                "transition-all duration-200",
                                "min-w-[64px]"
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-accent" : "text-text-muted"
                                    )}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-indicator"
                                        className="absolute -inset-2 bg-accent/10 rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium",
                                    isActive ? "text-accent" : "text-text-muted"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
