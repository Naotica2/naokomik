import { NextRequest, NextResponse } from "next/server";
import { getLatestManga } from "@/lib/scrapers";
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
        const page = parseInt(searchParams.get("page") || "1", 10);
        const tag = searchParams.get("tag") || "hot";

        const result = await getLatestManga(page, tag);

        return NextResponse.json(
            {
                ...result.data,
                source: result.source,
            },
            {
                headers: {
                    ...getRateLimitHeaders(rateLimit),
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
            }
        );
    } catch (error) {
        console.error("[API] Error fetching manga:", error);
        return NextResponse.json(
            {
                error: {
                    message:
                        error instanceof Error ? error.message : "Failed to fetch manga",
                },
            },
            { status: 500 }
        );
    }
}
