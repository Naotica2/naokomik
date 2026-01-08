import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export function isSupabaseConfigured() {
    return Boolean(supabaseUrl && supabaseAnonKey)
}

// Client-side Supabase client (for use in components)
export function createSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a mock client that does nothing for build time
        return null
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (for API routes)
export function createSupabaseServerClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null
    }
    return createClient(supabaseUrl, supabaseAnonKey)
}

// Singleton for client-side
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
    if (!isSupabaseConfigured()) {
        return null
    }
    if (!supabaseClient) {
        supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!)
    }
    return supabaseClient
}

