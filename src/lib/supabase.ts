import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if real Supabase credentials are provided
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "" &&
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    supabaseUrl !== "https://your-supabase-project.supabase.co" &&
    supabaseUrl.startsWith("https://") &&
    supabaseAnonKey !== "" &&
    supabaseAnonKey !== "placeholder-anon-key" &&
    supabaseAnonKey !== "your-supabase-anon-key"
  );
};

// Initialize Supabase client with dummy fallback if unconfigured to prevent runtime errors
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder"
);
