import { supabase } from "@/integrations/supabase/client";

export type Post = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  badge: string;
  animation: string;
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
};

export type Donation = {
  id: string;
  name: string;
  amount: number;
  message: string;
  created_at: string;
};

export type FloaterRow = { id: string; content: string; kind: string };

export type Settings = {
  id: number;
  total_amount: number;
  card_number: string;
  card_holder: string;
  floater_interval_sec: number;
};

export const siteQuery = {
  queryKey: ["site-data"],
  queryFn: async () => {
    const [posts, comments, reviews, donations, floaters, settings] = await Promise.all([
      supabase.from("posts").select("*").order("created_at", { ascending: false }),
      supabase.from("comments").select("*").order("created_at", { ascending: true }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("donations").select("*").order("created_at", { ascending: false }),
      supabase.from("floaters").select("*"),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    return {
      posts: (posts.data ?? []) as Post[],
      comments: (comments.data ?? []) as Comment[],
      reviews: (reviews.data ?? []) as Review[],
      donations: (donations.data ?? []) as Donation[],
      floaters: (floaters.data ?? []) as FloaterRow[],
      settings: (settings.data ?? {
        id: 1,
        total_amount: 0,
        card_number: "9860 1766 1972 7397",
        card_holder: "TILANCHILIK.UZ VIP",
        floater_interval_sec: 60,
      }) as Settings,
    };
  },
};

export function uzs(n: number) {
  // Deterministic grouping (server/client must render identical text).
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
