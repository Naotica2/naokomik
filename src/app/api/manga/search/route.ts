import { NextRequest, NextResponse } from "next/server";
import { searchManga } from "@/lib/scrapers";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
    // Check rate limit
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: { message: "Too many requests. Please try again later." } },
            {
                status: 429,
                headers: getRateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const page = parseInt(searchParams.get("page") || "1", 10);

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: { message: "Search query is required" } },
                { status: 400 }
            );
        }

        if (query.trim().length < 2) {
            return NextResponse.json(
                { error: { message: "Search query must be at least 2 characters" } },
                { status: 400 }
            );
        }

        const result = await searchManga(query.trim(), page);

        return NextResponse.json(
            {
                ...result.data,
                query: query.trim(),
                source: result.source,
            },
            {
                headers: {
                    ...getRateLimitHeaders(rateLimit),
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            }
        );
    } catch (error) {
        console.error("[API] Error searching manga:", error);
        return NextResponse.json(
            {
                error: {
                    message:
                        error instanceof Error ? error.message : "Failed to search manga",
                },
            },
            { status: 500 }
        );
    }
}
