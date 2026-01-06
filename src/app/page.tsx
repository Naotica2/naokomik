"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { FeaturedCarousel } from "@/components/manga/featured-carousel";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ReadingHistory } from "@/components/history/reading-history";
import type { Manga } from "@/types/manga";

interface MangaResponse {
  data: Manga[];
  source: string;
  currentPage: number;
  nextPage: string | null;
}

export default function HomePage() {
  const [featuredManga, setFeaturedManga] = useState<Manga[]>([]);
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchManga() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/manga?tag=hot&page=1");

        if (!response.ok) {
          throw new Error("Failed to fetch manga");
        }

        const data: MangaResponse = await response.json();

        if (data.data && data.data.length > 0) {
          // Use first 5 for featured carousel
          setFeaturedManga(data.data.slice(0, 5));
          // Use remaining for popular section
          setPopularManga(data.data.slice(5, 17));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan"
        );
        console.error("Error fetching manga:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchManga();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        {loading ? (
          <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-surface animate-pulse flex items-center justify-center rounded-none md:rounded-xl md:mx-4 lg:mx-8">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : featuredManga.length > 0 ? (
          <div className="md:px-4 lg:px-8">
            <FeaturedCarousel
              manga={featuredManga}
              className="rounded-none md:rounded-xl"
            />
          </div>
        ) : null}
      </section>

      {/* Main Content */}
      <div className="container-custom py-8 md:py-12 space-y-12">
        {/* Reading History */}
        <ReadingHistory />

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center"
          >
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-300 underline hover:no-underline"
            >
              Coba lagi
            </button>
          </motion.div>
        )}

        {/* Popular Manga Section */}
        <section>
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <h2 className="section-title">Komik Populer</h2>
            </div>
            <Link href="/komik" className="section-link group">
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="manga-grid">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-lg skeleton"
                />
              ))}
            </div>
          ) : (
            <MangaGrid manga={popularManga} />
          )}
        </section>

        {/* Quick Links */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Popular Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/komik?sort=popular"
                className="card group p-6 flex items-center gap-4 hover:border-accent/50"
              >
                <div className="p-3 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Paling Populer
                  </h3>
                  <p className="text-sm text-text-muted">
                    Baca komik terpopuler
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Latest Updates Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/komik?sort=latest"
                className="card group p-6 flex items-center gap-4 hover:border-accent/50"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Update Terbaru
                  </h3>
                  <p className="text-sm text-text-muted">
                    Chapter terbaru hari ini
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Browse All Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/komik"
                className="card group p-6 flex items-center gap-4 hover:border-accent/50"
              >
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <ArrowRight className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Jelajahi Semua
                  </h3>
                  <p className="text-sm text-text-muted">
                    Temukan komik favoritmu
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
