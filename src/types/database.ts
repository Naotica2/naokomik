export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            user_levels: {
                Row: {
                    id: number
                    name: string
                    display_name: string
                    gradient_from: string
                    gradient_to: string
                    glow_color: string
                    min_points: number
                }
                Insert: {
                    id?: number
                    name: string
                    display_name: string
                    gradient_from?: string
                    gradient_to?: string
                    glow_color?: string
                    min_points?: number
                }
                Update: {
                    id?: number
                    name?: string
                    display_name?: string
                    gradient_from?: string
                    gradient_to?: string
                    glow_color?: string
                    min_points?: number
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string
                    password_hash: string
                    bio: string
                    avatar_url: string | null
                    avatar_updated_at: string | null
                    level_id: number
                    points: number
                    is_admin: boolean
                    device_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    bio?: string
                    avatar_url?: string | null
                    level_id?: number
                    points?: number
                    is_admin?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    bio?: string
                    avatar_url?: string | null
                    level_id?: number
                    points?: number
                    is_admin?: boolean
                    updated_at?: string
                }
            }
            favorite_comics: {
                Row: {
                    id: string
                    user_id: string
                    comic_slug: string
                    comic_title: string
                    comic_cover: string | null
                    added_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    comic_slug: string
                    comic_title: string
                    comic_cover?: string | null
                    added_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    comic_slug?: string
                    comic_title?: string
                    comic_cover?: string | null
                    added_at?: string
                }
            }
            reading_history: {
                Row: {
                    id: string
                    user_id: string
                    comic_slug: string
                    comic_title: string
                    comic_cover: string | null
                    last_chapter: string | null
                    chapter_url: string | null
                    read_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    comic_slug: string
                    comic_title: string
                    comic_cover?: string | null
                    last_chapter?: string | null
                    chapter_url?: string | null
                    read_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    comic_slug?: string
                    comic_title?: string
                    comic_cover?: string | null
                    last_chapter?: string | null
                    chapter_url?: string | null
                    read_at?: string
                }
            }
            account_limits: {
                Row: {
                    id: string
                    email: string
                    account_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    account_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    account_count?: number
                }
            }
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserLevel = Database['public']['Tables']['user_levels']['Row']
export type FavoriteComic = Database['public']['Tables']['favorite_comics']['Row']
export type ReadingHistory = Database['public']['Tables']['reading_history']['Row']

export type ProfileWithLevel = Profile & {
    user_levels: UserLevel
}
