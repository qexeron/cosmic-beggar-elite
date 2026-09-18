import { supabase } from "@/integrations/supabase/client";

export type MediaKind = "image" | "gif" | "video" | "none";
export type PostAnimation = "zoom" | "slide" | "flip" | "glitch";
export type FloaterKind = "emoji" | "meme" | "gif" | "sticker";
export type DonationSource = "admin" | "public";

export type Post = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  media_url: string | null;
  media_kind: MediaKind;
  sticker: string | null;
  pinned: boolean;
  badge: string;
  animation: PostAnimation;
  likes: number;
  views: number;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author: string;
  body: string;
  created_at: string;
};

export type Review = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  body: string;
  created_at: string;
};

export type Donation = {
  id: string;
  name: string;
  amount: number;
  message: string;
  source: DonationSource;
  visible: boolean;
  created_at: string;
};

export type FloaterRow = { id: string; content: string; kind: FloaterKind; created_at: string };

export type Settings = {
  id: number;
  total_amount: number;
  card_number: string;
  card_holder: string;
  floater_interval_sec: number;
  hero_lines: string[];
  thanks_lines: string[];
  marquee_text: string;
  donate_note: string;
  public_donations: boolean;
  sound_enabled: boolean;
};

export const DEFAULT_HERO_LINES = [
  "Tilanchi bu — shunchaki kasb emas, bu san'at! 🎨",
  "Siz bergan 1000 so'm — bizning VIP kelajagimiz. 💎",
];

export const DEFAULT_THANKS_LINES = ["Siz rasman VIP saxiysiz! 👑"];

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return list.length ? list : fallback;
}

export const SITE_QUERY_KEY = ["site-data"] as const;

export const siteQuery = {
  queryKey: SITE_QUERY_KEY,
  queryFn: async () => {
    const [posts, comments, reviews, donations, floaters, settings] = await Promise.all([
      supabase
        .from("posts")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("comments").select("*").order("created_at", { ascending: true }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(60),
      supabase.from("floaters").select("*"),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    const rawSettings = settings.data;

    return {
      posts: (posts.data ?? []) as Post[],
      comments: (comments.data ?? []) as Comment[],
      reviews: (reviews.data ?? []) as Review[],
      donations: (donations.data ?? []) as Donation[],
      floaters: (floaters.data ?? []) as FloaterRow[],
      settings: {
        id: 1,
        total_amount: rawSettings?.total_amount ?? 0,
        card_number: rawSettings?.card_number ?? "9860 1766 1972 7397",
        card_holder: rawSettings?.card_holder ?? "TILANCHILIK.UZ VIP",
        floater_interval_sec: rawSettings?.floater_interval_sec ?? 25,
        hero_lines: asStringArray(rawSettings?.hero_lines, DEFAULT_HERO_LINES),
        thanks_lines: asStringArray(rawSettings?.thanks_lines, DEFAULT_THANKS_LINES),
        marquee_text: rawSettings?.marquee_text?.trim() || "TILANCHILIK.UZ • VIP KLUB",
        donate_note: rawSettings?.donate_note?.trim() || "",
        public_donations: rawSettings?.public_donations ?? true,
        sound_enabled: rawSettings?.sound_enabled ?? true,
      } satisfies Settings,
    };
  },
};

export function uzs(n: number) {
  // Locale-independent formatting so SSR and client output match exactly.
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
