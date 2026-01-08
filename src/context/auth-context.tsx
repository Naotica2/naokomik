"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { ProfileWithLevel } from "@/types/database";

interface AuthContextType {
    user: ProfileWithLevel | null;
    isLoading: boolean;
    isAdmin: boolean;
    isConfigured: boolean;
    signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (username: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get or create device ID
function getDeviceId(): string {
    if (typeof window === "undefined") return "";

    let deviceId = localStorage.getItem("naokomik_device_id");
    if (!deviceId) {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        deviceId = Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
        localStorage.setItem("naokomik_device_id", deviceId);
    }
    return deviceId;
}

// Get stored session
function getStoredSession(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("naokomik_session");
}

// Store session
function storeSession(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("naokomik_session", token);
}

// Clear session
function clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("naokomik_session");
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ProfileWithLevel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfigured, setIsConfigured] = useState(false);

    // Check session on mount
    useEffect(() => {
        setIsConfigured(isSupabaseConfigured());
        checkSession();
    }, []);

    const checkSession = async () => {
        const token = getStoredSession();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Validate session via API (server-side)
            const response = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.user) {
                setUser(data.user as ProfileWithLevel);
            } else {
                clearSession();
            }
        } catch (error) {
            console.error("Session check error:", error);
            clearSession();
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = useCallback(async () => {
        const token = getStoredSession();
        if (!token) return;

        try {
            const response = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();
            if (data.user) {
                setUser(data.user as ProfileWithLevel);
            }
        } catch (error) {
            console.error("Refresh profile error:", error);
        }
    }, []);

    const signIn = async (username: string, password: string) => {
        setIsLoading(true);

        try {
            // Call secure login API (server-side bcrypt verification)
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsLoading(false);
                return { error: new Error(data.error || "Login failed") };
            }

            storeSession(data.token);
            setUser(data.user as ProfileWithLevel);
            setIsLoading(false);
            return { error: null };
        } catch (err) {
            setIsLoading(false);
            return { error: err instanceof Error ? err : new Error("Login failed") };
        }
    };

    const signUp = async (username: string, password: string) => {
        setIsLoading(true);

        try {
            const deviceId = getDeviceId();

            // Call secure register API (server-side bcrypt hashing)
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, deviceId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsLoading(false);
                return { error: new Error(data.error || "Registration failed") };
            }

            storeSession(data.token);
            setUser(data.user as ProfileWithLevel);
            setIsLoading(false);
            return { error: null };
        } catch (err) {
            setIsLoading(false);
            return { error: err instanceof Error ? err : new Error("Registration failed") };
        }
    };

    const signOut = async () => {
        const supabase = getSupabaseClient();
        const token = getStoredSession();

        if (supabase && token) {
            await supabase.from("user_sessions").delete().eq("token", token);
        }

        clearSession();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAdmin: user?.is_admin ?? false,
                isConfigured,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
