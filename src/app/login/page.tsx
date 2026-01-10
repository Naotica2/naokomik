"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, isLoading } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const { error } = await signIn(username, password);

        if (error) {
            setError(error.message);
        } else {
            // Login success, redirect to profile
            router.push("/profile");
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Login</h1>
                        <p className="text-text-secondary">Masuk ke akun Naokomik</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                                    }
                                    placeholder="username"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Login
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-border">
                            <p className="text-text-secondary text-sm">
                                Belum punya akun?{" "}
                                <Link
                                    href="/register"
                                    className="text-accent hover:text-accent-hover font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
