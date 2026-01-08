import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const { token, chapterSlug, comicSlug, comicTitle, comicCover, chapterTitle } = await req.json();

        if (!token || !chapterSlug) {
            return NextResponse.json(
                { error: "Token and chapter slug required" },
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

        // Validate session
        const { data: session } = await supabase
            .from("user_sessions")
            .select("user_id, expires_at")
            .eq("token", token)
            .single();

        if (!session || new Date(session.expires_at) < new Date()) {
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }

        const userId = session.user_id;

        // Check if this chapter was already read (to avoid duplicate points)
        const { data: existingRead } = await supabase
            .from("chapter_reads")
            .select("id")
            .eq("user_id", userId)
            .eq("chapter_slug", chapterSlug)
            .single();

        let pointsAdded = 0;

        if (!existingRead) {
            // First time reading this chapter - add point!
            pointsAdded = 1;

            // Record the chapter read
            await supabase.from("chapter_reads").insert({
                user_id: userId,
                chapter_slug: chapterSlug,
                comic_slug: comicSlug || "",
            });

            // Add point to user
            const { data: profile } = await supabase
                .from("profiles")
                .select("points, level_id")
                .eq("id", userId)
                .single();

            if (profile) {
                const newPoints = profile.points + 1;

                // Get appropriate level based on new points
                const { data: newLevel } = await supabase
                    .from("user_levels")
                    .select("id")
                    .lte("min_points", newPoints)
                    .order("min_points", { ascending: false })
                    .limit(1)
                    .single();

                // Update profile with new points and possibly new level
                await supabase
                    .from("profiles")
                    .update({
                        points: newPoints,
                        level_id: newLevel?.id || profile.level_id,
                    })
                    .eq("id", userId);
            }
        }

        // Update reading history (always update, even if chapter was read before)
        if (comicSlug && comicTitle) {
            await supabase
                .from("reading_history")
                .upsert({
                    user_id: userId,
                    comic_slug: comicSlug,
                    comic_title: comicTitle,
                    comic_cover: comicCover || null,
                    last_chapter: chapterTitle || chapterSlug,
                    chapter_url: `/komik/read/${chapterSlug}`,
                    read_at: new Date().toISOString(),
                }, {
                    onConflict: "user_id,comic_slug",
                });
        }

        return NextResponse.json({
            success: true,
            pointsAdded,
            message: pointsAdded > 0 ? "+1 point!" : "Chapter already read",
        });
    } catch (error) {
        console.error("Track read error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
