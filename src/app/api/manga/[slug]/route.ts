import { NextRequest, NextResponse } from "next/server";
import { getMangaDetail } from "@/lib/scrapers";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
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
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: { message: "Manga slug is required" } },
                { status: 400 }
            );
        }

        const result = await getMangaDetail(decodeURIComponent(slug));

        return NextResponse.json(
            {
                data: result.data,
                source: result.source,
            },
            {
                headers: {
                    ...getRateLimitHeaders(rateLimit),
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            }
        );
    } catch (error) {
        console.error("[API] Error fetching manga detail:", error);
        return NextResponse.json(
            {
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch manga details",
                },
            },
            { status: 500 }
        );
    }
}
