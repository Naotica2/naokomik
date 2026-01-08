"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Save, ArrowLeft, AlertCircle, Camera, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getSupabaseClient } from "@/lib/supabase";

const AVATAR_COOLDOWN_HOURS = 12;

export default function EditProfilePage() {
    const router = useRouter();
    const { user, isLoading, refreshProfile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [bio, setBio] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);
    const [canChangeAvatar, setCanChangeAvatar] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/register");
        }
    }, [user, isLoading, router]);

    const checkAvatarCooldown = useCallback(() => {
        if (!user?.avatar_updated_at) {
            setCanChangeAvatar(true);
            setCooldownRemaining(null);
            return;
        }

        const lastUpdate = new Date(user.avatar_updated_at);
        const cooldownEnd = new Date(lastUpdate.getTime() + AVATAR_COOLDOWN_HOURS * 60 * 60 * 1000);
        const now = new Date();

        if (now < cooldownEnd) {
            setCanChangeAvatar(false);
            const remaining = cooldownEnd.getTime() - now.getTime();
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            setCooldownRemaining(`${hours}h ${minutes}m`);
        } else {
            setCanChangeAvatar(true);
            setCooldownRemaining(null);
        }
    }, [user?.avatar_updated_at]);

    useEffect(() => {
        if (user) {
            setBio(user.bio || "");
            setAvatarPreview(user.avatar_url || null);

            // Check cooldown
            checkAvatarCooldown();
        }
    }, [user, checkAvatarCooldown]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be less than 2MB");
            return;
        }

        setAvatarFile(file);
        setError(null);

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const uploadAvatar = async (): Promise<string | null> => {
        if (!avatarFile || !user) return null;

        const supabase = getSupabaseClient();
        if (!supabase) return null;

        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile, {
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error("Failed to upload avatar");
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setSaving(true);

        try {
            const supabase = getSupabaseClient();
            if (!supabase || !user) throw new Error("Not authenticated");

            const updates: Record<string, unknown> = {
                bio: bio.trim(),
                updated_at: new Date().toISOString(),
            };

            // Upload avatar if changed
            if (avatarFile && canChangeAvatar) {
                const avatarUrl = await uploadAvatar();
                if (avatarUrl) {
                    updates.avatar_url = avatarUrl;
                    updates.avatar_updated_at = new Date().toISOString();
                }
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (updateError) throw updateError;

            await refreshProfile();
            setSuccess(true);
            setAvatarFile(null);

            setTimeout(() => {
                router.push("/profile");
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container-custom py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Profile
                </button>

                <div className="glass rounded-2xl p-6 md:p-8">
                    <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm"
                            >
                                Profile updated successfully! Redirecting...
                            </motion.div>
                        )}

                        {/* Avatar Upload */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium">Avatar</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface border-2 border-border">
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-purple-600">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={!canChangeAvatar}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={!canChangeAvatar}
                                        className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Choose Image
                                    </button>
                                    {cooldownRemaining && (
                                        <p className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                                            <Clock className="w-3 h-3" />
                                            Can change in {cooldownRemaining}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-text-secondary">
                                        Max 2MB, JPG/PNG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Username (read-only) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">
                                Username (cannot be changed)
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type="text"
                                    value={user.username}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3 bg-surface/50 border border-border rounded-lg text-text-secondary cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label htmlFor="bio" className="block text-sm font-medium">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                            />
                            <p className="text-xs text-text-secondary text-right">
                                {bio.length}/500
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
