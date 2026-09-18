import { createServerFn } from "@tanstack/react-start";
import { getRequest, useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { isAdmin?: boolean };

function sessionSecret() {
  const secret = process.env["SESSION_SECRET"];
  if (!secret || secret.length < 16) {
    // Fails loudly instead of throwing an opaque crypto error deep inside iron-session.
    throw new Error(
      "SESSION_SECRET muhit o'zgaruvchisi o'rnatilmagan (kamida 16 belgi). Admin panel ishlamaydi.",
    );
  }
  return secret;
}

function sessionConfig() {
  return {
    password: sessionSecret(),
    name: "tilanchilik-admin",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      // Localhost (http://) can't set a `secure` cookie — the login would silently
      // fail to persist. Only require HTTPS once we're actually deployed.
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function matches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.isAdmin) throw new Error("Ruxsat yo'q — admin emassiz 😈");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function clientIp(): string {
  try {
    const req = getRequest();
    const fwd = req?.headers?.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]!.trim();
    return req?.headers?.get("x-real-ip") ?? "unknown";
  } catch {
    return "unknown";
  }
}

// Best-effort in-memory rate limiter. Resets on cold start / redeploy — fine for
// a joke site's abuse guard, not a substitute for real infra rate limiting.
const hits = new Map<string, number[]>();
function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    // cheap cleanup so the map can't grow unbounded on a long-running server
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return false;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}
function trimTo(s: string, max: number) {
  return (s ?? "").toString().trim().slice(0, max);
}
function strArray(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .slice(0, maxItems)
    .map((x) => trimTo(x, maxLen));
}

const MEDIA_KINDS = new Set(["image", "gif", "video", "none"]);
const ANIMATIONS = new Set(["zoom", "slide", "flip", "glitch"]);
const FLOATER_KINDS = new Set(["emoji", "meme", "gif", "sticker"]);

/* ============================== AUTH ============================== */

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSWORD"];
    const ip = clientIp();
    if (rateLimited(`login:${ip}`, 10, 5 * 60 * 1000)) {
      return { ok: false as const, throttled: true as const };
    }
    if (!expected || !matches(data.password ?? "", expected)) {
      return { ok: false as const };
    }
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ isAdmin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { isAdmin: Boolean(session.data.isAdmin) };
});

/* ============================== POSTS ============================== */

export const createPost = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      body: string;
      image_url?: string;
      media_url?: string;
      media_kind?: string;
      sticker?: string;
      pinned?: boolean;
      badge?: string;
      animation?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const title = trimTo(data.title, 140);
    const body = trimTo(data.body, 2000);
    if (!title || !body) throw new Error("Sarlavha va matn kerak.");

    const media_kind = MEDIA_KINDS.has(data.media_kind ?? "") ? data.media_kind! : "image";
    const media_url = trimTo(data.media_url ?? data.image_url ?? "", 2000) || null;
    const animation = ANIMATIONS.has(data.animation ?? "") ? data.animation! : "zoom";

    const db = await admin();
    const { error } = await db.from("posts").insert({
      title,
      body,
      image_url: media_url,
      media_url,
      media_kind: media_url ? media_kind : "none",
      sticker: trimTo(data.sticker ?? "", 30) || null,
      pinned: Boolean(data.pinned),
      badge: trimTo(data.badge, 60) || "🔥 RASMIY E'LON",
      animation,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deletePost = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updatePostStats = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; likes: number; views: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db
      .from("posts")
      .update({
        likes: Math.round(clamp(data.likes, 0, 999_999_999)),
        views: Math.round(clamp(data.views, 0, 999_999_999)),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setPostPinned = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; pinned: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("posts").update({ pinned: data.pinned }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ============================== COMMENTS ============================== */

export const addComment = createServerFn({ method: "POST" })
  .inputValidator((data: { post_id: string; author: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const body = trimTo(data.body, 400);
    if (!data.post_id || !body) throw new Error("Post va izoh matni kerak.");
    const db = await admin();
    const { error } = await db.from("comments").insert({
      post_id: data.post_id,
      author: trimTo(data.author, 60) || "Admin",
      body,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ============================== REVIEWS ============================== */

export const addReview = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; role: string; avatar: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const name = trimTo(data.name, 60);
    const body = trimTo(data.body, 500);
    if (!name || !body) throw new Error("Ism va sharh matni kerak.");
    const db = await admin();
    const { error } = await db.from("reviews").insert({
      name,
      role: trimTo(data.role, 60) || "VIP Donater",
      avatar: trimTo(data.avatar, 8) || "👑",
      body,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ============================== DONATIONS ============================== */

/** Admin-entered "seed" donations — same table as public ones, tagged source: 'admin'. */
export const addDonation = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; amount: number; message: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const amount = Math.round(clamp(data.amount, 0, 1_000_000_000));
    const { error } = await db.from("donations").insert({
      name: trimTo(data.name, 60) || "Anonim VIP",
      amount,
      message: trimTo(data.message, 160),
      source: "admin",
      visible: true,
    });
    if (error) throw new Error(error.message);
    if (amount > 0) {
      await db.rpc("increment_total_amount", { delta: amount }).throwOnError();
    }
    return { ok: true as const };
  });

export const deleteDonation = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("donations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setDonationVisible = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; visible: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db
      .from("donations")
      .update({ visible: data.visible })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/**
 * The ONLY write path a visitor (no admin session) can reach. Deliberately
 * narrow: fixed bounds, trimmed text, IP rate-limited, and the running total
 * is bumped atomically in Postgres (not read-modify-write from here) so two
 * donations landing at once can't clobber each other. Toggled off entirely
 * when the admin flips site_settings.public_donations to false.
 */
export const donatePublic = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; amount: number; message: string }) => data)
  .handler(async ({ data }) => {
    const ip = clientIp();
    if (rateLimited(`donate:${ip}`, 8, 10 * 60 * 1000)) {
      throw new Error("Juda tez-tez donat qilyapsiz 😅 Birozdan keyin urinib ko'ring.");
    }

    const amount = Math.round(clamp(Number(data.amount), 1000, 1_000_000_000));
    if (!Number.isFinite(data.amount) || data.amount < 1000) {
      throw new Error("Kamida 1 000 so'm kiriting.");
    }

    const db = await admin();
    const { data: settings } = await db
      .from("site_settings")
      .select("public_donations")
      .eq("id", 1)
      .maybeSingle();
    if (settings && settings.public_donations === false) {
      throw new Error("Ochiq donat hozircha o'chirilgan.");
    }

    const name = trimTo(data.name, 60) || "Anonim saxiy";
    const message = trimTo(data.message, 160);

    const { error } = await db.from("donations").insert({
      name,
      amount,
      message,
      source: "public",
      visible: true,
    });
    if (error) throw new Error(error.message);

    const { data: total, error: rpcError } = await db.rpc("increment_total_amount", {
      delta: amount,
    });
    if (rpcError) throw new Error(rpcError.message);

    return { ok: true as const, amount, total_amount: total as number };
  });

/* ============================== FLOATERS ============================== */

export const addFloater = createServerFn({ method: "POST" })
  .inputValidator((data: { content: string; kind: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const content = trimTo(data.content, data.kind === "meme" ? 220 : 2000);
    if (!content) throw new Error("Mazmun kerak.");
    const kind = FLOATER_KINDS.has(data.kind) ? data.kind : "emoji";
    const db = await admin();
    const { error } = await db.from("floaters").insert({ content, kind });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteFloater = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("floaters").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ============================== SETTINGS ============================== */

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      total_amount: number;
      card_number: string;
      card_holder: string;
      floater_interval_sec: number;
      hero_lines?: string[];
      thanks_lines?: string[];
      marquee_text?: string;
      donate_note?: string;
      public_donations?: boolean;
      sound_enabled?: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db
      .from("site_settings")
      .update({
        total_amount: Math.round(clamp(data.total_amount, 0, 999_999_999_999)),
        card_number: trimTo(data.card_number, 40),
        card_holder: trimTo(data.card_holder, 60),
        floater_interval_sec: Math.round(clamp(data.floater_interval_sec, 3, 600)),
        hero_lines: strArray(data.hero_lines, 30, 160),
        thanks_lines: strArray(data.thanks_lines, 30, 160),
        marquee_text: trimTo(data.marquee_text ?? "", 400),
        donate_note: trimTo(data.donate_note ?? "", 300),
        public_donations: Boolean(data.public_donations),
        sound_enabled: Boolean(data.sound_enabled),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
