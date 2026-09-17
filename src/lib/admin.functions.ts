import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { isAdmin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "tilanchilik-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
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

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSWORD"];
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

export const createPost = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      body: string;
      image_url?: string;
      badge?: string;
      animation?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("posts").insert({
      title: data.title,
      body: data.body,
      image_url: data.image_url || null,
      badge: data.badge || "🔥 RASMIY E'LON",
      animation: data.animation || "zoom",
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
      .update({ likes: data.likes, views: data.views })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const addComment = createServerFn({ method: "POST" })
  .inputValidator((data: { post_id: string; author: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("comments").insert({
      post_id: data.post_id,
      author: data.author || "Admin",
      body: data.body,
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

export const addReview = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; role: string; avatar: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("reviews").insert({
      name: data.name,
      role: data.role || "VIP Donater",
      avatar: data.avatar || "👑",
      body: data.body,
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

export const addDonation = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; amount: number; message: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db.from("donations").insert({
      name: data.name || "Anonim VIP",
      amount: data.amount || 0,
      message: data.message || "",
    });
    if (error) throw new Error(error.message);
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

export const addFloater = createServerFn({ method: "POST" })
  .inputValidator((data: { content: string; kind: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db
      .from("floaters")
      .insert({ content: data.content, kind: data.kind || "emoji" });
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

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      total_amount: number;
      card_number: string;
      card_holder: string;
      floater_interval_sec: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await admin();
    const { error } = await db
      .from("site_settings")
      .update({
        total_amount: data.total_amount,
        card_number: data.card_number,
        card_holder: data.card_holder,
        floater_interval_sec: data.floater_interval_sec,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
