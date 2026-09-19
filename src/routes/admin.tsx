import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { useLiveSite } from "@/hooks/use-live-site";
import { SITE_QUERY_KEY, uzs } from "@/lib/site-data";
import { STICKERS } from "@/components/animated-sticker";
import {
  addComment,
  addDonation,
  addFloater,
  addReview,
  adminLogin,
  adminLogout,
  adminStatus,
  createPost,
  deleteComment,
  deleteDonation,
  deleteFloater,
  deletePost,
  deleteReview,
  setDonationVisible,
  setPostPinned,
  updatePostStats,
  updateSettings,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "VIP Admin Panel — TILANCHI.UZ" },
      { name: "description", content: "Postlar, donat statistikasi va sharhlarni boshqarish." },
      { property: "og:title", content: "VIP Admin Panel — TILANCHI.UZ" },
      { property: "og:description", content: "Faqat admin uchun boshqaruv paneli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const field =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary";
const STICKER_NAMES = Object.keys(STICKERS) as (keyof typeof STICKERS)[];

function AdminPage() {
  const status = useServerFn(adminStatus);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    status()
      .then((r) => setIsAdmin(Boolean(r?.isAdmin)))
      .catch((err) => {
        console.error("Admin status check failed:", err);
        setIsAdmin(false);
      });
  }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await login({ data: { password } });
    if (res.ok) {
      setIsAdmin(true);
      setError("");
    } else if ("throttled" in res && res.throttled) {
      setError("⏳ Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.");
    } else setError("❌ Xato parol! Siz admin emassiz 😈");
  }

  if (isAdmin === null) {
    return <div className="p-10 text-center text-muted-foreground">Yuklanmoqda…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={submit} className="glass w-full max-w-sm rounded-3xl p-8 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-3 font-display text-xl font-black gold-text">VIP ADMIN PANEL</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Maxfiy parol"
            className={`${field} mt-6`}
          />
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          <button type="submit" className="btn-vip hover:btn-vip-hover mt-5 w-full">
            Kirish
          </button>
          <Link to="/" className="mt-4 block text-xs text-muted-foreground">
            ← Saytga qaytish
          </Link>
        </form>
      </div>
    );
  }

  return (
    <Dashboard
      onLogout={async () => {
        await logout();
        setIsAdmin(false);
      }}
    />
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const { data } = useLiveSite();
  const refresh = () => qc.invalidateQueries({ queryKey: SITE_QUERY_KEY });

  const fns = {
    createPost: useServerFn(createPost),
    deletePost: useServerFn(deletePost),
    updatePostStats: useServerFn(updatePostStats),
    setPostPinned: useServerFn(setPostPinned),
    addComment: useServerFn(addComment),
    deleteComment: useServerFn(deleteComment),
    addReview: useServerFn(addReview),
    deleteReview: useServerFn(deleteReview),
    addDonation: useServerFn(addDonation),
    deleteDonation: useServerFn(deleteDonation),
    setDonationVisible: useServerFn(setDonationVisible),
    addFloater: useServerFn(addFloater),
    deleteFloater: useServerFn(deleteFloater),
    updateSettings: useServerFn(updateSettings),
  };

  const [post, setPost] = useState({
    title: "",
    body: "",
    media_url: "",
    media_kind: "image" as "image" | "gif" | "video" | "none",
    sticker: "coin" as keyof typeof STICKERS,
    pinned: false,
    badge: "🔥 RASMIY E'LON",
    animation: "zoom" as "zoom" | "slide" | "flip" | "glitch",
  });
  const [postBusy, setPostBusy] = useState(false);
  const [review, setReview] = useState({ name: "", role: "", avatar: "👑", body: "" });
  const [donation, setDonation] = useState({ name: "", amount: "", message: "" });
  const [floater, setFloater] = useState<{ content: string; kind: "emoji" | "meme" | "gif" | "sticker" }>({
    content: "",
    kind: "emoji",
  });
  const [comment, setComment] = useState({ post_id: "", author: "Admin", body: "" });
  const [settings, setSettingsState] = useState({
    total_amount: "",
    card_number: "",
    card_holder: "",
    floater_interval_sec: "",
    marquee_text: "",
    donate_note: "",
    public_donations: true,
    sound_enabled: true,
    hero_lines: "",
    thanks_lines: "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!data?.settings) return;
    const s = data.settings;
    setSettingsState({
      total_amount: String(s.total_amount),
      card_number: s.card_number,
      card_holder: s.card_holder,
      floater_interval_sec: String(s.floater_interval_sec),
      marquee_text: s.marquee_text,
      donate_note: s.donate_note,
      public_donations: s.public_donations,
      sound_enabled: s.sound_enabled,
      hero_lines: s.hero_lines.join("\n"),
      thanks_lines: s.thanks_lines.join("\n"),
    });
  }, [data?.settings]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black gold-text">👑 VIP ADMIN PANEL</h1>
        <div className="flex gap-2">
          <Link to="/" className="btn-ghost-gold px-4 py-2 text-xs">
            Sayt
          </Link>
          <button onClick={onLogout} className="btn-ghost-gold px-4 py-2 text-xs">
            Chiqish
          </button>
        </div>
      </div>

      {/* NEW POST */}
      <Card title="📝 Yangi post / mem">
        <input
          className={field}
          placeholder="Sarlavha"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
        />
        <textarea
          className={`${field} mt-3 min-h-28`}
          placeholder="Post matni (yumor)"
          value={post.body}
          onChange={(e) => setPost({ ...post, body: e.target.value })}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select
            className={field}
            value={post.media_kind}
            onChange={(e) => setPost({ ...post, media_kind: e.target.value as typeof post.media_kind })}
          >
            <option value="image">🖼️ Rasm</option>
            <option value="gif">🎞️ GIF</option>
            <option value="video">🎬 Video (mp4)</option>
            <option value="none">🚫 Media yo'q (stiker)</option>
          </select>
          {post.media_kind === "none" ? (
            <select
              className={field}
              value={post.sticker}
              onChange={(e) => setPost({ ...post, sticker: e.target.value as keyof typeof STICKERS })}
            >
              {STICKER_NAMES.map((s) => (
                <option key={s} value={s}>
                  {STICKERS[s].emoji} {STICKERS[s].label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={field}
              placeholder="Rasm / GIF / Video havolasi"
              value={post.media_url}
              onChange={(e) => setPost({ ...post, media_url: e.target.value })}
            />
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            className={field}
            placeholder="Yorliq (badge)"
            value={post.badge}
            onChange={(e) => setPost({ ...post, badge: e.target.value })}
          />
          <select
            className={field}
            value={post.animation}
            onChange={(e) => setPost({ ...post, animation: e.target.value as typeof post.animation })}
          >
            <option value="zoom">Kosmik zoom</option>
            <option value="slide">Sirg'alib chiqish</option>
            <option value="flip">Aylanib chiqish</option>
            <option value="glitch">Glitch</option>
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={post.pinned}
              onChange={(e) => setPost({ ...post, pinned: e.target.checked })}
            />
            📌 Tepaga mahkamlash
          </label>
        </div>
        <button
          className="btn-vip hover:btn-vip-hover mt-4 disabled:opacity-60"
          disabled={postBusy}
          onClick={async () => {
            if (!post.title || !post.body) return;
            setPostBusy(true);
            try {
              await fns.createPost({
                data: {
                  title: post.title,
                  body: post.body,
                  media_url: post.media_kind === "none" ? "" : post.media_url,
                  media_kind: post.media_kind,
                  sticker: post.media_kind === "none" ? post.sticker : "",
                  pinned: post.pinned,
                  badge: post.badge,
                  animation: post.animation,
                },
              });
              setPost({ ...post, title: "", body: "", media_url: "" });
              refresh();
            } finally {
              setPostBusy(false);
            }
          }}
        >
          🚀 E'lon qilish
        </button>

        <div className="mt-6 space-y-3">
          {data?.posts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-primary">
                  {p.pinned && "📌 "}
                  {p.title}
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="text-xs text-muted-foreground"
                    onClick={async () => {
                      await fns.setPostPinned({ data: { id: p.id, pinned: !p.pinned } });
                      refresh();
                    }}
                  >
                    {p.pinned ? "Bo'shatish" : "📌 Mahkamlash"}
                  </button>
                  <button
                    className="text-xs text-destructive"
                    onClick={async () => {
                      await fns.deletePost({ data: { id: p.id } });
                      refresh();
                    }}
                  >
                    O'chirish
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  className="w-24 rounded-lg border border-border bg-background/60 px-2 py-1 text-xs"
                  defaultValue={p.likes}
                  id={`likes-${p.id}`}
                />
                <input
                  className="w-24 rounded-lg border border-border bg-background/60 px-2 py-1 text-xs"
                  defaultValue={p.views}
                  id={`views-${p.id}`}
                />
                <button
                  className="btn-ghost-gold px-3 py-1 text-xs"
                  onClick={async () => {
                    const likes = Number(
                      (document.getElementById(`likes-${p.id}`) as HTMLInputElement).value,
                    );
                    const views = Number(
                      (document.getElementById(`views-${p.id}`) as HTMLInputElement).value,
                    );
                    await fns.updatePostStats({ data: { id: p.id, likes, views } });
                    refresh();
                  }}
                >
                  Statistikani saqlash
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* COMMENTS */}
      <Card title="💬 Izohlar (faqat admin yozadi)">
        <select
          className={field}
          value={comment.post_id}
          onChange={(e) => setComment({ ...comment, post_id: e.target.value })}
        >
          <option value="">Postni tanlang…</option>
          {data?.posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
          <input
            className={field}
            placeholder="Muallif"
            value={comment.author}
            onChange={(e) => setComment({ ...comment, author: e.target.value })}
          />
          <input
            className={field}
            placeholder="Izoh matni"
            value={comment.body}
            onChange={(e) => setComment({ ...comment, body: e.target.value })}
          />
        </div>
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            if (!comment.post_id || !comment.body) return;
            await fns.addComment({ data: comment });
            setComment({ ...comment, body: "" });
            refresh();
          }}
        >
          Izoh qo'shish
        </button>
        <div className="mt-5 space-y-2">
          {data?.comments.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-2 text-xs"
            >
              <span>
                <b className="text-primary">{c.author}:</b> {c.body}
              </span>
              <button
                className="text-destructive"
                onClick={async () => {
                  await fns.deleteComment({ data: { id: c.id } });
                  refresh();
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* SITE TEXTS */}
      <Card title="✍️ Sayt matnlari (hero, minnatdorchilik, lenta)">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Hero gaplari (har biri yangi qatorda)
            </label>
            <textarea
              className={`${field} min-h-28`}
              value={settings.hero_lines}
              onChange={(e) => setSettingsState({ ...settings, hero_lines: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Minnatdorchilik gaplari (har biri yangi qatorda)
            </label>
            <textarea
              className={`${field} min-h-28`}
              value={settings.thanks_lines}
              onChange={(e) => setSettingsState({ ...settings, thanks_lines: e.target.value })}
            />
          </div>
        </div>
        <input
          className={`${field} mt-3`}
          placeholder="Aylanma lenta matni (marquee)"
          value={settings.marquee_text}
          onChange={(e) => setSettingsState({ ...settings, marquee_text: e.target.value })}
        />
        <input
          className={`${field} mt-3`}
          placeholder="Donat bo'limi ostidagi eslatma"
          value={settings.donate_note}
          onChange={(e) => setSettingsState({ ...settings, donate_note: e.target.value })}
        />
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.public_donations}
              onChange={(e) => setSettingsState({ ...settings, public_donations: e.target.checked })}
            />
            Mehmonlar donat qila oladi
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.sound_enabled}
              onChange={(e) => setSettingsState({ ...settings, sound_enabled: e.target.checked })}
            />
            Ovozli effektlar yoqilgan
          </label>
        </div>
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            await fns.updateSettings({
              data: {
                total_amount: Number(settings.total_amount) || 0,
                card_number: settings.card_number,
                card_holder: settings.card_holder,
                floater_interval_sec: Number(settings.floater_interval_sec) || 25,
                hero_lines: settings.hero_lines.split("\n").map((s) => s.trim()).filter(Boolean),
                thanks_lines: settings.thanks_lines.split("\n").map((s) => s.trim()).filter(Boolean),
                marquee_text: settings.marquee_text,
                donate_note: settings.donate_note,
                public_donations: settings.public_donations,
                sound_enabled: settings.sound_enabled,
              },
            });
            setSettingsSaved(true);
            window.setTimeout(() => setSettingsSaved(false), 1800);
            refresh();
          }}
        >
          {settingsSaved ? "✅ Saqlandi" : "Matnlarni saqlash"}
        </button>
      </Card>

      {/* DONATIONS */}
      <Card title="💰 Donat boshqaruvi">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={field}
            placeholder="Jami summa (qo'lda tuzatish)"
            value={settings.total_amount}
            onChange={(e) => setSettingsState({ ...settings, total_amount: e.target.value })}
          />
          <input
            className={field}
            placeholder="Karta raqami"
            value={settings.card_number}
            onChange={(e) => setSettingsState({ ...settings, card_number: e.target.value })}
          />
          <input
            className={field}
            placeholder="Karta egasi"
            value={settings.card_holder}
            onChange={(e) => setSettingsState({ ...settings, card_holder: e.target.value })}
          />
          <input
            className={field}
            placeholder="Mem uchish oralig'i (sekund)"
            value={settings.floater_interval_sec}
            onChange={(e) => setSettingsState({ ...settings, floater_interval_sec: e.target.value })}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Eslatma: "Jami summa"ni qo'lda o'zgartirish faqat qayta tiklash/tuzatish uchun — har bir
          real donat summani avtomatik oshiradi.
        </p>
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            await fns.updateSettings({
              data: {
                total_amount: Number(settings.total_amount) || 0,
                card_number: settings.card_number,
                card_holder: settings.card_holder,
                floater_interval_sec: Number(settings.floater_interval_sec) || 25,
                hero_lines: settings.hero_lines.split("\n").map((s) => s.trim()).filter(Boolean),
                thanks_lines: settings.thanks_lines.split("\n").map((s) => s.trim()).filter(Boolean),
                marquee_text: settings.marquee_text,
                donate_note: settings.donate_note,
                public_donations: settings.public_donations,
                sound_enabled: settings.sound_enabled,
              },
            });
            refresh();
          }}
        >
          Saqlash
        </button>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <input
            className={field}
            placeholder="Ism"
            value={donation.name}
            onChange={(e) => setDonation({ ...donation, name: e.target.value })}
          />
          <input
            className={field}
            placeholder="Summa"
            value={donation.amount}
            onChange={(e) => setDonation({ ...donation, amount: e.target.value })}
          />
          <input
            className={field}
            placeholder="Kulgili xabar"
            value={donation.message}
            onChange={(e) => setDonation({ ...donation, message: e.target.value })}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Bu yerdan qo'shilgan yozuv ham jami summani avtomatik oshiradi (soxta "ijtimoiy isbot" uchun).
        </p>
        <button
          className="btn-ghost-gold mt-3 text-xs"
          onClick={async () => {
            await fns.addDonation({
              data: {
                name: donation.name,
                amount: Number(donation.amount) || 0,
                message: donation.message,
              },
            });
            setDonation({ name: "", amount: "", message: "" });
            refresh();
          }}
        >
          Donat yozuvi qo'shish
        </button>
        <div className="mt-4 space-y-2">
          {data?.donations.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 px-4 py-2 text-xs"
            >
              <span className={d.visible ? "" : "opacity-40 line-through"}>
                <b className="text-primary">{d.name}</b> — {uzs(d.amount)} — {d.message}{" "}
                <em className="not-italic text-muted-foreground">
                  ({d.source === "public" ? "mehmon" : "admin"})
                </em>
              </span>
              <span className="flex gap-3">
                <button
                  className="text-muted-foreground"
                  onClick={async () => {
                    await fns.setDonationVisible({ data: { id: d.id, visible: !d.visible } });
                    refresh();
                  }}
                >
                  {d.visible ? "Yashirish" : "Ko'rsatish"}
                </button>
                <button
                  className="text-destructive"
                  onClick={async () => {
                    await fns.deleteDonation({ data: { id: d.id } });
                    refresh();
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* REVIEWS */}
      <Card title="⭐ Soxta sharhlar">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className={field}
            placeholder="Ism"
            value={review.name}
            onChange={(e) => setReview({ ...review, name: e.target.value })}
          />
          <input
            className={field}
            placeholder="Lavozim"
            value={review.role}
            onChange={(e) => setReview({ ...review, role: e.target.value })}
          />
          <input
            className={field}
            placeholder="Emoji"
            value={review.avatar}
            onChange={(e) => setReview({ ...review, avatar: e.target.value })}
          />
        </div>
        <textarea
          className={`${field} mt-3 min-h-20`}
          placeholder="Sharh matni"
          value={review.body}
          onChange={(e) => setReview({ ...review, body: e.target.value })}
        />
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            if (!review.name || !review.body) return;
            await fns.addReview({ data: review });
            setReview({ name: "", role: "", avatar: "👑", body: "" });
            refresh();
          }}
        >
          Sharh qo'shish
        </button>
        <div className="mt-5 space-y-2">
          {data?.reviews.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-2 text-xs"
            >
              <span>
                {r.avatar} <b className="text-primary">{r.name}</b> — {r.body}
              </span>
              <button
                className="text-destructive"
                onClick={async () => {
                  await fns.deleteReview({ data: { id: r.id } });
                  refresh();
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* FLOATERS */}
      <Card title="🛸 Uchib o'tuvchi memlar, emojilar, GIF va stikerlar">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          {floater.kind === "sticker" ? (
            <select
              className={field}
              value={floater.content}
              onChange={(e) => setFloater({ ...floater, content: e.target.value })}
            >
              <option value="">Stiker tanlang…</option>
              {STICKER_NAMES.map((s) => (
                <option key={s} value={s}>
                  {STICKERS[s].emoji} {STICKERS[s].label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={field}
              placeholder={
                floater.kind === "gif"
                  ? "GIF havolasi (https://...)"
                  : floater.kind === "meme"
                    ? "Uchib o'tadigan yumorli gap"
                    : "Emoji (masalan 💸)"
              }
              value={floater.content}
              onChange={(e) => setFloater({ ...floater, content: e.target.value })}
            />
          )}
          <select
            className={field}
            value={floater.kind}
            onChange={(e) =>
              setFloater({ content: "", kind: e.target.value as typeof floater.kind })
            }
          >
            <option value="emoji">Emoji</option>
            <option value="meme">Mem kartochka</option>
            <option value="gif">GIF</option>
            <option value="sticker">Animatsion stiker</option>
          </select>
        </div>
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            if (!floater.content) return;
            await fns.addFloater({ data: floater });
            setFloater({ content: "", kind: floater.kind });
            refresh();
          }}
        >
          Qo'shish
        </button>
        <div className="mt-5 flex flex-wrap gap-2">
          {data?.floaters.map((f) => (
            <span
              key={f.id}
              className="flex max-w-full items-center gap-2 rounded-full border border-border/50 px-3 py-1 text-xs"
            >
              <span className="truncate">
                {f.kind === "sticker" && STICKERS[f.content as keyof typeof STICKERS]
                  ? `${STICKERS[f.content as keyof typeof STICKERS].emoji} ${f.content}`
                  : f.content}
              </span>
              <button
                className="shrink-0 text-destructive"
                onClick={async () => {
                  await fns.deleteFloater({ data: { id: f.id } });
                  refresh();
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass mt-6 rounded-3xl p-6">
      <h2 className="font-display text-sm font-black tracking-widest text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
