"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Library, Flame, Clock, History, User, LogOut, LogIn, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { SearchBar } from "@/components/search/search-bar";
import { useAuth } from "@/context/auth-context";
import { DynamicRankBadge } from "@/components/user/rank-badge";

const navLinks = [
    { href: "/", label: "Home", icon: Flame },
    { href: "/latest", label: "Latest", icon: Clock },
    { href: "/komik", label: "Library", icon: Library },
    { href: "/history", label: "History", icon: History },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, isAdmin, signOut } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
        setIsUserMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await signOut();
        setIsUserMenuOpen(false);
        router.push("/");
    };

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

                        {/* Search & User & Menu */}
                        <div className="flex items-center gap-2">
                            {/* Desktop Search */}
                            <div className="hidden md:block w-64">
                                <SearchBar />
                            </div>

                            {/* User Menu (Desktop) */}
                            <div className="hidden md:block relative">
                                {isLoading ? (
                                    <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
                                ) : user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface transition-colors"
                                        >
                                            {user.avatar_url ? (
                                                <Image
                                                    src={user.avatar_url}
                                                    alt={user.username}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {isUserMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-2 w-64 glass rounded-xl border border-border/50 overflow-hidden"
                                                >
                                                    <div className="p-4 border-b border-border/50">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{user.username}</span>
                                                            {user.user_levels && (
                                                                <DynamicRankBadge level={user.user_levels} size="sm" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-secondary truncate">
                                                            {user.bio || "No bio"}
                                                        </p>
                                                    </div>
                                                    <div className="p-2">
                                                        <Link
                                                            href="/profile"
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
                                                        >
                                                            <User className="w-4 h-4" />
                                                            Profile
                                                        </Link>
                                                        {isAdmin && (
                                                            <Link
                                                                href="/naokomikadminasli"
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface transition-colors"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            Logout
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        href="/register"
                                        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Register
                                    </Link>
                                )}
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

                                {/* Mobile Auth Links */}
                                <div className="pt-2 border-t border-border/50 space-y-2">
                                    {user ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                                            >
                                                <User className="w-5 h-5" />
                                                Profile
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href="/naokomikadminasli"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Shield className="w-5 h-5" />
                                                    Admin
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/register"
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-accent hover:bg-accent-subtle"
                                        >
                                            <LogIn className="w-5 h-5" />
                                            Register
                                        </Link>
                                    )}
                                </div>
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
