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
        const { username, password, deviceId } = await req.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 20) {
            return NextResponse.json(
                { error: "Username must be 3-20 characters" },
                { status: 400 }
            );
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json(
                { error: "Username can only contain letters, numbers, underscore" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
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

        // Check device account limit (max 2)
        if (deviceId) {
            const { data: limit } = await supabase
                .from("account_limits")
                .select("account_count")
                .eq("device_id", deviceId)
                .single();

            if (limit && limit.account_count >= 2) {
                return NextResponse.json(
                    { error: "Maximum 2 accounts per device" },
                    { status: 429 }
                );
            }
        }

        // Check username availability
        const { data: existing } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "Username already taken" },
                { status: 409 }
            );
        }

        // Hash password with bcrypt (secure server-side hashing)
        const passwordHash = await bcrypt.hash(password, 12);

        // Create profile
        const { data: newProfile, error: profileError } = await supabase
            .from("profiles")
            .insert({
                username: username.toLowerCase(),
                password_hash: passwordHash,
                device_id: deviceId || null,
                level_id: 1,
                points: 0,
                is_admin: false,
                bio: "",
            })
            .select("id, username, bio, avatar_url, level_id, points, is_admin, created_at")
            .single();

        if (profileError || !newProfile) {
            console.error("Profile creation error:", profileError);
            return NextResponse.json(
                { error: "Failed to create account" },
                { status: 500 }
            );
        }

        // Update device limit
        if (deviceId) {
            const { data: limit } = await supabase
                .from("account_limits")
                .select("account_count")
                .eq("device_id", deviceId)
                .single();

            if (limit) {
                await supabase
                    .from("account_limits")
                    .update({ account_count: limit.account_count + 1 })
                    .eq("device_id", deviceId);
            } else {
                await supabase.from("account_limits").insert({
                    device_id: deviceId,
                    account_count: 1,
                });
            }
        }

        // Create session
        const token = generateSessionToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await supabase.from("user_sessions").insert({
            user_id: newProfile.id,
            token,
            expires_at: expiresAt.toISOString(),
        });

        // Fetch user with level
        const { data: userWithLevel } = await supabase
            .from("profiles")
            .select("*, user_levels(*)")
            .eq("id", newProfile.id)
            .single();

        return NextResponse.json({
            success: true,
            user: userWithLevel,
            token,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
