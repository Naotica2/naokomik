import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ user: null });
        }

        const supabase = createSupabaseServerClient();
        if (!supabase) {
            return NextResponse.json({ user: null });
        }

        // Validate session
        const { data: session } = await supabase
            .from("user_sessions")
            .select("user_id, expires_at")
            .eq("token", token)
            .single();

        if (!session || new Date(session.expires_at) < new Date()) {
            // Session expired or invalid
            if (session) {
                await supabase.from("user_sessions").delete().eq("token", token);
            }
            return NextResponse.json({ user: null });
        }

        // Fetch user profile with level
        const { data: user } = await supabase
            .from("profiles")
            .select("id, username, bio, avatar_url, avatar_updated_at, level_id, points, is_admin, created_at, user_levels(*)")
            .eq("id", session.user_id)
            .single();

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Session validation error:", error);
        return NextResponse.json({ user: null });
    }
}
