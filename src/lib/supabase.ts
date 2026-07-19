import { createClient } from "@supabase/supabase-js";

let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
// Strip accidental surrounding quotes if pasted from .env directly
if ((rawUrl.startsWith('"') && rawUrl.endsWith('"')) || (rawUrl.startsWith("'") && rawUrl.endsWith("'"))) {
  rawUrl = rawUrl.slice(1, -1).trim();
}
// If url doesn't start with http/https but looks like domain, prepend https://
if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}

let rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
  rawKey = rawKey.slice(1, -1).trim();
}

// Validate URL format with try-catch
let isValidUrl = false;
try {
  if (rawUrl && rawUrl.startsWith("http")) {
    new URL(rawUrl);
    isValidUrl = true;
  }
} catch (e) {
  isValidUrl = false;
}

// Check if real Supabase credentials are provided and valid
export const isSupabaseConfigured = () => {
  return (
    isValidUrl &&
    rawUrl !== "" &&
    rawUrl !== "https://placeholder-project.supabase.co" &&
    rawUrl !== "https://your-supabase-project.supabase.co" &&
    rawUrl !== "https://<your-project-id>.supabase.co" &&
    rawKey !== "" &&
    rawKey !== "placeholder-anon-key" &&
    rawKey !== "your-supabase-anon-key" &&
    rawKey !== "<your-supabase-anon-key>"
  );
};

const finalUrl = isSupabaseConfigured() ? rawUrl : "https://placeholder.supabase.co";
const finalKey = isSupabaseConfigured() ? rawKey : "placeholder";

// Initialize Supabase client with dummy fallback if unconfigured or malformed to prevent runtime errors
export const supabase = createClient(finalUrl, finalKey);
