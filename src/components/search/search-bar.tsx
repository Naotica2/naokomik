"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    defaultValue?: string;
    onSearch?: (query: string) => void;
    autoFocus?: boolean;
}

export function SearchBar({
    className,
    placeholder = "Cari manga...",
    defaultValue = "",
    onSearch,
    autoFocus = false,
}: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    const handleSearch = useCallback(
        (searchQuery: string) => {
            if (onSearch) {
                onSearch(searchQuery);
            } else if (searchQuery.trim().length >= 2) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
        },
        [onSearch, router]
    );

    useEffect(() => {
        if (debouncedQuery.trim().length >= 2) {
            handleSearch(debouncedQuery);
        }
    }, [debouncedQuery, handleSearch]);

    const handleClear = () => {
        setQuery("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            handleSearch(query);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("relative", className)}>
            <div
                className={cn(
                    "relative flex items-center",
                    "bg-surface border rounded-lg overflow-hidden",
                    "transition-all duration-200",
                    isFocused
                        ? "border-accent ring-1 ring-accent/50"
                        : "border-border hover:border-text-muted"
                )}
            >
                <Search className="absolute left-3 w-5 h-5 text-text-muted pointer-events-none" />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-full py-2.5 pl-10 pr-10",
                        "bg-transparent text-text-primary placeholder:text-text-muted",
                        "focus:outline-none"
                    )}
                />

                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 p-1 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </form>
    );
}
