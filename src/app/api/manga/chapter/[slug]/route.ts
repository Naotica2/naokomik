import { NextRequest, NextResponse } from "next/server";
import { getChapterImages } from "@/lib/scrapers";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";
import { buildProxyUrls, getBaseUrl } from "@/lib/utils";

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
                { error: { message: "Chapter slug is required" } },
                { status: 400 }
            );
        }

        const result = await getChapterImages(decodeURIComponent(slug));
        const baseUrl = getBaseUrl(request);

        // Wrap images with proxy URLs for CORS
        const proxiedImages = buildProxyUrls(result.data.images, baseUrl);

        return NextResponse.json(
            {
                data: {
                    ...result.data,
                    images: proxiedImages,
                },
                source: result.source,
            },
            {
                headers: {
                    ...getRateLimitHeaders(rateLimit),
                    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
                },
            }
        );
    } catch (error) {
        console.error("[API] Error fetching chapter images:", error);
        return NextResponse.json(
            {
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch chapter images",
                },
            },
            { status: 500 }
        );
    }
}
