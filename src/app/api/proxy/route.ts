import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = [
    "komiku.org",
    "cdn.komiku.co.id",
    "img.komiku.id",
    "api.komiku.org",
    // Komikcast domains
    "komikcast.bz",
    "komikcast.io",
    "komikcast.me",
    "komikcast.lol",
    "komikcast.cz",
    "komikcast01.com",
    "komikcast02.com",
    "komikcast03.com",
    "komikcast04.com",
    "komikcast05.com",
    "svr1.imgkc1.xyz",
    "svr2.imgkc1.xyz",
    "svr3.imgkc1.xyz",
    "svr1.imgkc2.xyz",
    "cdn.komikcast.cz",
    // WordPress CDN (often used by Komikcast)
    "i0.wp.com",
    "i1.wp.com",
    "i2.wp.com",
    "i3.wp.com",
];

function isAllowedDomain(url: string): boolean {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;

        // Check exact match or subdomain match
        const exactMatch = ALLOWED_DOMAINS.some(
            (domain) =>
                hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (exactMatch) return true;

        // Additional patterns for Komikcast CDN domains (they change frequently)
        if (hostname.includes("komikcast") || hostname.includes("imgkc")) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return NextResponse.json(
            { error: { message: "URL parameter is required" } },
            { status: 400 }
        );
    }

    const decodedUrl = decodeURIComponent(imageUrl);

    // Validate URL
    if (!isAllowedDomain(decodedUrl)) {
        return NextResponse.json(
            { error: { message: "Domain not allowed" } },
            { status: 403 }
        );
    }

    try {
        const response = await fetch(decodedUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Referer: new URL(decodedUrl).origin,
                Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: { message: `Failed to fetch image: ${response.status}` } },
                { status: response.status }
            );
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, immutable",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("[Proxy] Error fetching image:", error);
        return NextResponse.json(
            {
                error: {
                    message:
                        error instanceof Error ? error.message : "Failed to proxy image",
                },
            },
            { status: 500 }
        );
    }
}
