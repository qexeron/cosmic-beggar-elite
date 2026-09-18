import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { SITE_QUERY_KEY, siteQuery } from "@/lib/site-data";

const TABLES = ["posts", "comments", "reviews", "donations", "floaters", "site_settings"] as const;

/**
 * Sayt ma'lumotlarini Supabase realtime orqali tirik ushlab turadi:
 * admin post qo'shsa — barcha ochiq sahifalarda o'zi paydo bo'ladi.
 * Realtime ishlamasa (proxy, websocket bloklangan) 30 sekundlik polling zaxira bo'ladi.
 */
export function useLiveSite() {
  const qc = useQueryClient();

  const query = useQuery({
    ...siteQuery,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const invalidate = () => {
      void qc.invalidateQueries({ queryKey: SITE_QUERY_KEY });
    };

    const channel = supabase.channel("tilanchilik-live");
    for (const table of TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, invalidate);
    }
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}
