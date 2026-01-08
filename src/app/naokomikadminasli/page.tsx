"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Shield,
    Users,
    Search,
    ChevronDown,
    Save,
    AlertCircle,
    Check,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getSupabaseClient } from "@/lib/supabase";
import { DynamicRankBadge } from "@/components/user/rank-badge";
import { ProfileWithLevel, UserLevel } from "@/types/database";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isLoading, isAdmin } = useAuth();
    const [users, setUsers] = useState<ProfileWithLevel[]>([]);
    const [levels, setLevels] = useState<UserLevel[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from("profiles")
            .select(
                `
        *,
        user_levels (*)
      `
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            return;
        }

        setUsers(data as ProfileWithLevel[]);
        setLoadingUsers(false);
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
            return;
        }

        if (!isLoading && !isAdmin) {
            router.push("/");
            return;
        }
    }, [user, isLoading, isAdmin, router]);

    useEffect(() => {
        async function fetchLevels() {
            const supabase = getSupabaseClient();
            const { data } = await supabase
                .from("user_levels")
                .select("*")
                .order("min_points", { ascending: true });

            if (data) setLevels(data);
        }

        if (isAdmin) {
            fetchUsers();
            fetchLevels();
        }
    }, [isAdmin, fetchUsers]);

    const handleUpdateLevel = async (userId: string) => {
        if (!selectedLevel) return;

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const supabase = getSupabaseClient();

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ level_id: selectedLevel })
                .eq("id", userId);

            if (updateError) throw updateError;

            setSuccessMessage("User level updated successfully!");
            setEditingUser(null);
            setSelectedLevel(null);
            fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update level");
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.user_levels?.display_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    if (isLoading || !isAdmin) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container-custom py-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Shield className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-text-secondary text-sm">Manage users and ranks</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-accent" />
                        <div>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <div className="text-xs text-text-secondary">Total Users</div>
                        </div>
                    </div>
                </div>
                {levels.map((level) => {
                    const count = users.filter((u) => u.level_id === level.id).length;
                    return (
                        <div key={level.id} className="glass rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <DynamicRankBadge level={level} size="sm" />
                                <div>
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className="text-xs text-text-secondary">Users</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Messages */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}

            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                    <Check className="w-4 h-4" />
                    {successMessage}
                </motion.div>
            )}

            {/* User Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl overflow-hidden"
            >
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-11 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                </div>

                {loadingUsers ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                                        Username
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                                        Level
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                                        Points
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                                        Joined
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-surface/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{u.username}</span>
                                                {u.is_admin && (
                                                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-medium rounded">
                                                        ADMIN
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingUser === u.id ? (
                                                <select
                                                    value={selectedLevel || u.level_id}
                                                    onChange={(e) =>
                                                        setSelectedLevel(Number(e.target.value))
                                                    }
                                                    className="px-2 py-1 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                                >
                                                    {levels.map((level) => (
                                                        <option key={level.id} value={level.id}>
                                                            {level.display_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : u.user_levels ? (
                                                <DynamicRankBadge level={u.user_levels} size="sm" />
                                            ) : (
                                                <span className="text-text-secondary">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary">{u.points}</td>
                                        <td className="px-4 py-3 text-text-secondary text-sm">
                                            {new Date(u.created_at).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingUser === u.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateLevel(u.id)}
                                                        disabled={saving}
                                                        className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors disabled:opacity-50"
                                                    >
                                                        {saving ? (
                                                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(null);
                                                            setSelectedLevel(null);
                                                        }}
                                                        className="p-1.5 bg-surface hover:bg-surface-hover text-text-secondary rounded transition-colors"
                                                    >
                                                        <ChevronDown className="w-4 h-4 rotate-90" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(u.id);
                                                        setSelectedLevel(u.level_id);
                                                    }}
                                                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                                                >
                                                    Change Level
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
