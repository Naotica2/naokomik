import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseServerClient } from "@/lib/supabase";

// Generate session token
function generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseServerClient();
        if (!supabase) {
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 500 }
            );
        }

        // Find user
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, username, password_hash, bio, avatar_url, level_id, points, is_admin")
            .eq("username", username.toLowerCase())
            .single();

        if (error || !profile) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(password, profile.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        // Create session
        const token = generateSessionToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        // Delete old sessions for this user (optional: limit active sessions)
        await supabase
            .from("user_sessions")
            .delete()
            .eq("user_id", profile.id)
            .lt("expires_at", new Date().toISOString());

        await supabase.from("user_sessions").insert({
            user_id: profile.id,
            token,
            expires_at: expiresAt.toISOString(),
        });

        // Fetch user with level
        const { data: userWithLevel } = await supabase
            .from("profiles")
            .select("*, user_levels(*)")
            .eq("id", profile.id)
            .single();

        // Remove password_hash from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash: _, ...safeUser } = userWithLevel || profile;

        return NextResponse.json({
            success: true,
            user: safeUser,
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
