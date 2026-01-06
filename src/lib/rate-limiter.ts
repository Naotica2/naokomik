import { NextRequest } from "next/server";

interface RateLimitStore {
    count: number;
    timestamp: number;
}

const store = new Map<string, RateLimitStore>();

const RATE_LIMIT_REQUESTS = parseInt(
    process.env.RATE_LIMIT_REQUESTS || "60",
    10
);
const RATE_LIMIT_WINDOW_MS = parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "60000",
    10
);

/**
 * Simple in-memory rate limiter using sliding window
 * Returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(req: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
} {
    const ip = getClientIp(req);
    const now = Date.now();

    const existing = store.get(ip);

    if (!existing || now - existing.timestamp > RATE_LIMIT_WINDOW_MS) {
        // New window
        store.set(ip, { count: 1, timestamp: now });
        return {
            allowed: true,
            remaining: RATE_LIMIT_REQUESTS - 1,
            resetIn: RATE_LIMIT_WINDOW_MS,
        };
    }

    if (existing.count >= RATE_LIMIT_REQUESTS) {
        // Rate limited
        const resetIn = RATE_LIMIT_WINDOW_MS - (now - existing.timestamp);
        return {
            allowed: false,
            remaining: 0,
            resetIn,
        };
    }

    // Increment count
    existing.count++;
    return {
        allowed: true,
        remaining: RATE_LIMIT_REQUESTS - existing.count,
        resetIn: RATE_LIMIT_WINDOW_MS - (now - existing.timestamp),
    };
}

/**
 * Creates rate limit headers for response
 */
export function getRateLimitHeaders(rateLimit: {
    remaining: number;
    resetIn: number;
}): Record<string, string> {
    return {
        "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimit.resetIn / 1000).toString(),
    };
}

/**
 * Get client IP from request headers
 */
function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    return "unknown";
}

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        Array.from(store.entries()).forEach(([ip, data]) => {
            if (now - data.timestamp > RATE_LIMIT_WINDOW_MS * 2) {
                store.delete(ip);
            }
        });
    }, 5 * 60 * 1000);
}
