import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-surface/50 mt-16">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <Image
                                src="/logo.png"
                                alt="Naokomik"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                                Naokomik
                            </span>
                        </Link>
                        <p className="text-sm text-text-muted max-w-md">
                            Platform baca manga, manhwa, dan manhua gratis dengan koleksi
                            lengkap dan update terbaru. Nikmati pengalaman membaca yang
                            nyaman tanpa iklan.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/", label: "Home" },
                                { href: "/manga", label: "Library" },
                                { href: "/manga?tag=hot", label: "Popular" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-muted hover:text-accent transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
                            Info
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://github.com/fahmih6/Weebs_Scraper"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
                                >
                                    <Github className="w-4 h-4" />
                                    Based on Weebs_Scraper
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-border/50">
                    <p className="text-xs text-text-muted text-center">
                        © {new Date().getFullYear()} Naokomik. Baca komik gratis.
                    </p>
                </div>
            </div>
        </footer>
    );
}
