import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

export type Database = {
    public: {
        Tables: {
            hotspots: {
                Row: {
                    id: string;
                    lat: number;
                    lng: number;
                    title: string;
                    description: string;
                    severity: "low" | "medium" | "high" | "critical";
                    photo_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    lat: number;
                    lng: number;
                    title: string;
                    description: string;
                    severity: "low" | "medium" | "high" | "critical";
                    photo_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    lat?: number;
                    lng?: number;
                    title?: string;
                    description?: string;
                    severity?: "low" | "medium" | "high" | "critical";
                    photo_url?: string | null;
                    created_at?: string;
                };
            };
        };
    };
};
