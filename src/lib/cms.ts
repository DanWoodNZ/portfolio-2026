import { supabase, isSupabaseConfigured } from "./supabase";
import { PROJECTS as SEED_PROJECTS, CAREER_HISTORY, EDUCATION_HISTORY, CareerItem, HistoryPhotoItem, INITIAL_HISTORY_PHOTOS } from "@/data/projects";
export type { CareerItem, HistoryPhotoItem };

export interface HighlightItem {
  id: string;
  text: string;
}

export interface MediaGalleryItem {
  id: string;
  url: string;
  type: "image" | "video";
  order_index: number;
}

export interface CMSProject {
  id: string;
  slug: string;
  title: string;
  description: string; // maps to heroDescription in UI
  role: string;
  year: string;
  order_index: number;
  highlights: HighlightItem[]; // 0 to 3 items
  thumbnail: string;
  sections: any[];
  media_gallery?: MediaGalleryItem[];
  is_locked?: boolean;
  password?: string;
}

export interface VisualFeedItem {
  id: string;
  title: string;
  aspectRatio: string;
  src: string;
  order_index: number;
}

// Custom CDN Base URL configuration for direct media fetching (bypassing server-side API proxy routes)
export const CDN_BASE_URL = (
  process.env.NEXT_PUBLIC_CDN_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_URL ||
  "https://cdn.danrwood.com"
).replace(/\/$/, "");

// Normalize image and video paths so relative keys append directly to CDN base URL
const normalizeImage = (src?: string) => {
  if (!src || src.startsWith("/assets/projects/")) {
    return "/assets/misc/placeholder.jpg";
  }
  // If absolute URL, local static asset, or data/blob URI, return directly
  if (src.match(/^(http:\/\/|https:\/\/|data:|blob:)/i) || src.startsWith("/assets/")) {
    return src;
  }
  // Otherwise, append relative media file path/key directly to custom CDN base URL
  const cleanPath = src.replace(/^\/+/, "");
  return `${CDN_BASE_URL}/${cleanPath}`;
};

export const isVideoUrl = (src?: string) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.startsWith("data:video/") ||
    lower.includes(".mp4?") ||
    lower.includes(".webm?")
  );
};

// --- R2 Upload Helper ---
export async function uploadToR2(file: File): Promise<{ url: string; type: "image" | "video" }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Upload failed");
  }

  const data = await res.json();
  return { url: normalizeImage(data.url), type: data.type };
}

// --- Live Cross-Tab Reactivity Helper ---
export function notifyTabsOfChange(eventType = "storage-update") {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event(eventType));
      window.dispatchEvent(new Event("storage-update"));
      window.dispatchEvent(new Event("projects-updated"));
      window.dispatchEvent(new Event("visual-feed-updated"));
      window.dispatchEvent(new Event("history-updated"));
      window.dispatchEvent(new Event("career-updated"));
    } catch (e) {}

    try {
      localStorage.setItem("cms_last_update", `${eventType}_${Date.now()}`);
    } catch (e) {}

    try {
      const bc1 = new BroadcastChannel("cms_channel");
      bc1.postMessage({ type: eventType, timestamp: Date.now() });
      bc1.close();
      const bc2 = new BroadcastChannel("portfolio-sync");
      bc2.postMessage({ type: eventType, timestamp: Date.now() });
      bc2.close();
    } catch (e) {}
  }
}

export function isProjectUnlocked(slug: string): boolean {
  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem(`unlocked_project_${slug}`) === "true";
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function setProjectUnlocked(slug: string): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`unlocked_project_${slug}`, "true");
      window.dispatchEvent(new Event("project-unlocked"));
    } catch (e) {}
  }
}

const normalizeProject = (item: any): CMSProject => {
  const sections =
    typeof item.sections === "string"
      ? JSON.parse(item.sections)
      : item.sections || [];
  const normalizedSections = sections.map((sec: any) => ({
    ...sec,
    ...(sec.image1 && {
      image1: { ...sec.image1, src: normalizeImage(sec.image1.src) },
    }),
    ...(sec.image2 && {
      image2: { ...sec.image2, src: normalizeImage(sec.image2.src) },
    }),
  }));

  const gallery =
    typeof item.media_gallery === "string"
      ? JSON.parse(item.media_gallery)
      : item.media_gallery || [];
  const normalizedGallery: MediaGalleryItem[] = Array.isArray(gallery)
    ? gallery.map((g: any, idx: number) => ({
        id: g.id || `gallery-${idx}`,
        url: normalizeImage(g.url),
        type: g.type === "video" || isVideoUrl(g.url) ? "video" : "image",
        order_index: g.order_index ?? idx + 1,
      }))
    : [];

  return {
    ...item,
    is_locked: !!item.is_locked,
    password: item.password || "",
    thumbnail: normalizeImage(item.thumbnail),
    highlights: (typeof item.highlights === "string"
      ? JSON.parse(item.highlights)
      : Array.isArray(item.highlights) ? item.highlights : []
    ).map((h: any, idx: number) => {
      if (typeof h === "string") return { id: `h-${idx}-${Date.now()}`, text: h };
      if (h && typeof h === "object") return { id: h.id || `h-${idx}-${Date.now()}`, text: h.text || h.label || "" };
      return { id: `h-${idx}-${Date.now()}`, text: "" };
    }),
    sections: normalizedSections,
    media_gallery: normalizedGallery.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
  };
};

// Convert static projects to initial CMS format for read-only offline fallback
const getInitialProjects = (): CMSProject[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cms_local_projects_override");
      if (stored) {
        return JSON.parse(stored).map((p: any) => normalizeProject(p));
      }
    } catch (e) {}
  }
  return SEED_PROJECTS.map((p, idx) =>
    normalizeProject({
      id: `seed-${idx + 1}`,
      slug: p.slug,
      title: p.title,
      description: p.heroDescription || "",
      role: p.role,
      year: p.year,
      order_index: idx + 1,
      highlights: p.highlights || [],
      thumbnail: p.thumbnail || "/assets/misc/placeholder.jpg",
      sections: p.sections || [],
      media_gallery: [],
    })
  );
};

// --- DATA FETCHING (PROJECTS CRUD) ---

export async function getProjects(): Promise<CMSProject[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index", { ascending: true });
      if (!error && data && data.length > 0) {
        const normalized = data.map((item: any) => normalizeProject(item));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("cms_local_projects_override", JSON.stringify(normalized));
          } catch (e) {}
        }
        return normalized;
      } else if (error) {
        console.error("Supabase getProjects error (RLS or connection issue):", error.message || error);
      }
    } catch (e) {
      console.warn("Supabase fetch exception, returning local/static fallback.", e);
    }
  } else {
    if (typeof window !== "undefined") {
      console.warn("Supabase is not configured. Using local fallback. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Cloudflare Environment Variables.");
    }
  }
  return getInitialProjects();
}

export async function getProjectBySlug(slug: string): Promise<CMSProject | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function createProject(project: Partial<CMSProject>): Promise<{ success: boolean; error?: string; id?: string; warning?: string }> {
  const newSlug = project.title
    ? project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : `proj-${Date.now()}`;

  const toInsert: any = {
    slug: newSlug,
    title: project.title || "Untitled Project",
    description: project.description || "",
    role: project.role || "PRODUCT DESIGNER",
    year: project.year || new Date().getFullYear().toString(),
    order_index: project.order_index || 99,
    highlights: project.highlights || [],
    thumbnail: project.thumbnail || "/assets/misc/placeholder.jpg",
    sections: project.sections || [],
    media_gallery: project.media_gallery || [],
    is_locked: project.is_locked || false,
    password: project.password || "",
  };

  if (isSupabaseConfigured()) {
    try {
      let { data, error } = await supabase.from("projects").insert(toInsert).select().single();
      let warning: string | undefined;

      if (error && (error.message?.includes("is_locked") || error.message?.includes("password") || error.message?.includes("schema cache") || error.message?.includes("column"))) {
        const { is_locked, password, ...safeInsert } = toInsert;
        const retry = await supabase.from("projects").insert(safeInsert).select().single();
        if (retry.error) {
          return { success: false, error: retry.error.message };
        }
        data = retry.data;
        warning = "Created project without password settings because 'is_locked'/'password' columns are not added to Supabase yet. Run ALTER TABLE queries in supabase_schema.sql.";
      } else if (error) {
        return { success: false, error: error.message };
      }

      const all = await getProjects();
      if (typeof window !== "undefined") {
        try { localStorage.setItem("cms_local_projects_override", JSON.stringify(all)); } catch (e) {}
      }
      notifyTabsOfChange("projects-updated");
      return { success: true, id: data?.id || newSlug, warning };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Fallback / Local mode
  if (typeof window !== "undefined") {
    try {
      const all = await getProjects();
      const newProj = normalizeProject({ id: `local-${Date.now()}`, ...toInsert });
      const updated = [...all, newProj];
      localStorage.setItem("cms_local_projects_override", JSON.stringify(updated));
      notifyTabsOfChange("projects-updated");
      return { success: true, id: newProj.id, warning: "Saved locally (Supabase unconfigured)" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  return { success: false, error: "Supabase database is unconfigured and local storage is unavailable." };
}

export async function updateProject(id: string, updates: Partial<CMSProject>): Promise<{ success: boolean; error?: string; warning?: string }> {
  if (isSupabaseConfigured()) {
    try {
      let { error } = await supabase.from("projects").update(updates).eq("id", id);
      let warning: string | undefined;

      if (error && (error.message?.includes("is_locked") || error.message?.includes("password") || error.message?.includes("schema cache") || error.message?.includes("column"))) {
        const { is_locked, password, ...safeUpdates } = updates;
        const retry = await supabase.from("projects").update(safeUpdates).eq("id", id);
        if (retry.error) {
          return { success: false, error: retry.error.message };
        }
        error = null;
        warning = "Project details saved, but lock settings couldn't be saved because 'is_locked'/'password' columns are missing in Supabase DB. Run ALTER TABLE in supabase_schema.sql.";
      } else if (error) {
        return { success: false, error: error.message };
      }

      // Also update local cache
      if (typeof window !== "undefined") {
        try {
          const current = await getProjects();
          const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
          localStorage.setItem("cms_local_projects_override", JSON.stringify(updated));
        } catch (e) {}
      }
      notifyTabsOfChange("projects-updated");
      return { success: true, warning };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Fallback / Local mode
  if (typeof window !== "undefined") {
    try {
      const current = await getProjects();
      const updated = current.map((p) => (p.id === id ? normalizeProject({ ...p, ...updates }) : p));
      localStorage.setItem("cms_local_projects_override", JSON.stringify(updated));
      notifyTabsOfChange("projects-updated");
      return { success: true, warning: "Saved locally (Supabase unconfigured)" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  return { success: false, error: "Supabase database is unconfigured and local storage is unavailable." };
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      if (typeof window !== "undefined") {
        try {
          const current = await getProjects();
          const updated = current.filter((p) => p.id !== id);
          localStorage.setItem("cms_local_projects_override", JSON.stringify(updated));
        } catch (e) {}
      }
      notifyTabsOfChange("projects-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const current = await getProjects();
      const updated = current.filter((p) => p.id !== id);
      localStorage.setItem("cms_local_projects_override", JSON.stringify(updated));
      notifyTabsOfChange("projects-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  return { success: false, error: "Supabase database is unconfigured." };
}

export async function saveProjectsOrder(projects: CMSProject[]): Promise<{ success: boolean; error?: string }> {
  const reordered = projects.map((p, idx) => ({ ...p, order_index: idx + 1 }));

  if (isSupabaseConfigured()) {
    try {
      for (const p of reordered) {
        await supabase.from("projects").update({ order_index: p.order_index }).eq("id", p.id);
      }
      if (typeof window !== "undefined") {
        try { localStorage.setItem("cms_local_projects_override", JSON.stringify(reordered)); } catch (e) {}
      }
      notifyTabsOfChange("projects-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cms_local_projects_override", JSON.stringify(reordered));
      notifyTabsOfChange("projects-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  return { success: false, error: "Supabase database is unconfigured." };
}

// --- VISUAL FEED CRUD ---

const INITIAL_FEED_ITEMS: VisualFeedItem[] = [
  { id: "feed-1", title: "VISUAL EXPLORATION 01", aspectRatio: "aspect-[4/5]", src: "/assets/misc/placeholder.jpg", order_index: 1 },
  { id: "feed-2", title: "SYSTEM STUDY 02", aspectRatio: "aspect-[16/10]", src: "/assets/misc/placeholder.jpg", order_index: 2 },
  { id: "feed-3", title: "INTERFACE PROTOTYPE 03", aspectRatio: "aspect-[1/1]", src: "/assets/misc/placeholder.jpg", order_index: 3 },
  { id: "feed-4", title: "DESIGN TOKEN 04", aspectRatio: "aspect-[3/4]", src: "/assets/misc/placeholder.jpg", order_index: 4 },
  { id: "feed-5", title: "COMPONENT ARCHITECTURE 05", aspectRatio: "aspect-[4/3]", src: "/assets/misc/placeholder.jpg", order_index: 5 },
  { id: "feed-6", title: "MOBILE INTERACTION 06", aspectRatio: "aspect-[9/16]", src: "/assets/misc/placeholder.jpg", order_index: 6 },
  { id: "feed-7", title: "TYPOGRAPHIC SCALE 07", aspectRatio: "aspect-[1/1]", src: "/assets/misc/placeholder.jpg", order_index: 7 },
  { id: "feed-8", title: "MOTION PROTOTYPE 08", aspectRatio: "aspect-[16/9]", src: "/assets/misc/placeholder.jpg", order_index: 8 },
  { id: "feed-9", title: "ICONOGRAPHY SYSTEM 09", aspectRatio: "aspect-[4/5]", src: "/assets/misc/placeholder.jpg", order_index: 9 },
  { id: "feed-10", title: "SPATIAL INTERFACE 10", aspectRatio: "aspect-[16/10]", src: "/assets/misc/placeholder.jpg", order_index: 10 },
  { id: "feed-11", title: "SYSTEM ARCHIVE 11", aspectRatio: "aspect-[3/4]", src: "/assets/misc/placeholder.jpg", order_index: 11 },
  { id: "feed-12", title: "BRAND GUIDELINES 12", aspectRatio: "aspect-[1/1]", src: "/assets/misc/placeholder.jpg", order_index: 12 },
];

export async function getVisualFeedItems(): Promise<VisualFeedItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("visual_feed")
        .select("*")
        .order("order_index", { ascending: true });
      if (!error && data && data.length > 0) {
        return data
          .map((item: Record<string, unknown>) => ({
            id: String(item.id || ""),
            title: String(item.title || ""),
            aspectRatio: String(item.aspectRatio || item.aspect_ratio || "aspect-[4/3]"),
            src: normalizeImage(typeof item.src === "string" ? item.src : undefined),
            order_index: typeof item.order_index === "number" ? item.order_index : 0,
          }))
          .sort((a: VisualFeedItem, b: VisualFeedItem) => (a.order_index ?? 0) - (b.order_index ?? 0));
      }
    } catch (e) {
      console.warn("Supabase visual_feed fetch failed, using static fallback.", e);
    }
  }
  return [...INITIAL_FEED_ITEMS].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

export async function saveVisualFeedItems(items: VisualFeedItem[]): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const records = items.map((item, idx) => ({
        id: item.id,
        title: item.title || `VISUAL ASSET ${idx + 1}`,
        aspectRatio: item.aspectRatio || "aspect-[4/3]",
        src: item.src,
        order_index: item.order_index ?? idx + 1,
      }));
      const { error } = await supabase.from("visual_feed").upsert(records);
      if (error) {
        console.error("Supabase upsert visual_feed error:", error);
        return { success: false, error: error.message };
      }
      notifyTabsOfChange("visual-feed-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: "Supabase database is unconfigured." };
}

export async function deleteVisualFeedItem(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("visual_feed").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      notifyTabsOfChange("visual-feed-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: "Supabase database is unconfigured." };
}

// --- HISTORY PHOTOS CRUD ---

export async function getHistoryPhotos(): Promise<HistoryPhotoItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("history_photos")
        .select("*")
        .order("order_index", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          ...item,
          src: normalizeImage(item.src),
        }));
      }
    } catch (e) {
      console.warn("Supabase history_photos fetch failed, using static fallback.", e);
    }
  }
  return INITIAL_HISTORY_PHOTOS;
}

export async function saveHistoryPhotos(items: HistoryPhotoItem[]): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      for (const item of items) {
        await supabase.from("history_photos").upsert({
          id: item.id,
          src: item.src,
          alt: item.alt || "History photo",
          order_index: item.order_index || 1,
        });
      }
      notifyTabsOfChange("history-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: "Supabase database is unconfigured." };
}

// --- CAREER & EDUCATION CRUD ---

export async function getCareerItems(): Promise<CareerItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("career_items")
        .select("*")
        .order("order_index", { ascending: true });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase career_items fetch failed, using static fallback.", e);
    }
  }
  return CAREER_HISTORY.map((item, idx) => ({ ...item, id: `career-${idx}`, order_index: idx + 1 }));
}

export async function saveCareerItems(items: CareerItem[]): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      for (const item of items) {
        await supabase.from("career_items").upsert({
          id: item.id || `career-${Date.now()}`,
          company: item.company,
          role: item.role,
          year: item.year,
          order_index: item.order_index || 1,
        });
      }
      notifyTabsOfChange("career-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: "Supabase database is unconfigured." };
}

export async function getEducationItems(): Promise<CareerItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("education_items")
        .select("*")
        .order("order_index", { ascending: true });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase education_items fetch failed, using static fallback.", e);
    }
  }
  return EDUCATION_HISTORY.map((item, idx) => ({ ...item, id: `edu-${idx}`, order_index: idx + 1 }));
}

export async function saveEducationItems(items: CareerItem[]): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      for (const item of items) {
        await supabase.from("education_items").upsert({
          id: item.id || `edu-${Date.now()}`,
          company: item.company,
          role: item.role,
          year: item.year,
          order_index: item.order_index || 1,
        });
      }
      notifyTabsOfChange("career-updated");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: "Supabase database is unconfigured." };
}

// --- AUTHENTICATION (STRICT SUPABASE AUTH) ---

export const DEFAULT_ADMIN_EMAIL = "dan@example.com";
export const DEFAULT_ADMIN_PASSWORD = "";

export async function loginAdmin(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (!error) {
      return { success: true };
    }
    return { success: false, error: error.message };
  }
  return { success: false, error: "Supabase Auth is unconfigured. Please connect your live Supabase database in .env.local." };
}

export async function logoutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}

export async function checkIsAuthenticated(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }
  return false;
}
