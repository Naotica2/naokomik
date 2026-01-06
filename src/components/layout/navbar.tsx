"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Library, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { SearchBar } from "@/components/search/search-bar";

const navLinks = [
    { href: "/", label: "Home", icon: Flame },
    { href: "/latest", label: "Latest", icon: Clock },
    { href: "/komik", label: "Library", icon: Library },
];

export function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
    }, [pathname]);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50",
                    "transition-all duration-300",
                    isScrolled
                        ? "glass border-b border-border/50"
                        : "bg-transparent"
                )}
            >
                <nav className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <Image
                                src="/logo.png"
                                alt="Naokomik"
                                width={36}
                                height={36}
                                className="rounded-full"
                            />
                            <span className="font-bold text-lg hidden sm:block bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                                Naokomik
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg",
                                            "text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "text-accent bg-accent-subtle"
                                                : "text-text-secondary hover:text-text-primary hover:bg-surface"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Search & Menu */}
                        <div className="flex items-center gap-2">
                            {/* Desktop Search */}
                            <div className="hidden md:block w-64">
                                <SearchBar />
                            </div>

                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
                                aria-label="Toggle search"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile Search */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-border/50 bg-surface overflow-hidden"
                        >
                            <div className="container-custom py-3">
                                <SearchBar autoFocus />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-border/50 bg-surface overflow-hidden"
                        >
                            <div className="container-custom py-4 space-y-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg",
                                                "font-medium transition-all duration-200",
                                                isActive
                                                    ? "text-accent bg-accent-subtle"
                                                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Spacer */}
            <div className="h-16" />
        </>
    );
}
