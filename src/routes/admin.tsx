import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { siteQuery, uzs } from "@/lib/site-data";
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
  updatePostStats,
  updateSettings,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "VIP Admin Panel — TILANCHILIK.UZ" },
      { name: "description", content: "Postlar, donat statistikasi va sharhlarni boshqarish." },
      { property: "og:title", content: "VIP Admin Panel — TILANCHILIK.UZ" },
      { property: "og:description", content: "Faqat admin uchun boshqaruv paneli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const field =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary";

function AdminPage() {
  const status = useServerFn(adminStatus);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    status().then((r) => setIsAdmin(r.isAdmin));
  }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await login({ data: { password } });
    if (res.ok) {
      setIsAdmin(true);
      setError("");
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
  const { data } = useQuery(siteQuery);
  const refresh = () => qc.invalidateQueries({ queryKey: ["site-data"] });

  const fns = {
    createPost: useServerFn(createPost),
    deletePost: useServerFn(deletePost),
    updatePostStats: useServerFn(updatePostStats),
    addComment: useServerFn(addComment),
    deleteComment: useServerFn(deleteComment),
    addReview: useServerFn(addReview),
    deleteReview: useServerFn(deleteReview),
    addDonation: useServerFn(addDonation),
    deleteDonation: useServerFn(deleteDonation),
    addFloater: useServerFn(addFloater),
    deleteFloater: useServerFn(deleteFloater),
    updateSettings: useServerFn(updateSettings),
  };

  const [post, setPost] = useState({
    title: "",
    body: "",
    image_url: "",
    badge: "🔥 RASMIY E'LON",
    animation: "zoom",
  });
  const [review, setReview] = useState({ name: "", role: "", avatar: "👑", body: "" });
  const [donation, setDonation] = useState({ name: "", amount: "", message: "" });
  const [floater, setFloater] = useState({ content: "", kind: "emoji" });
  const [comment, setComment] = useState({ post_id: "", author: "Admin", body: "" });
  const [settings, setSettings] = useState({
    total_amount: "",
    card_number: "",
    card_holder: "",
    floater_interval_sec: "",
  });

  useEffect(() => {
    if (!data?.settings) return;
    setSettings({
      total_amount: String(data.settings.total_amount),
      card_number: data.settings.card_number,
      card_holder: data.settings.card_holder,
      floater_interval_sec: String(data.settings.floater_interval_sec),
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
        <input
          className={`${field} mt-3`}
          placeholder="Rasm yoki GIF havolasi"
          value={post.image_url}
          onChange={(e) => setPost({ ...post, image_url: e.target.value })}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            className={field}
            placeholder="Yorliq (badge)"
            value={post.badge}
            onChange={(e) => setPost({ ...post, badge: e.target.value })}
          />
          <select
            className={field}
            value={post.animation}
            onChange={(e) => setPost({ ...post, animation: e.target.value })}
          >
            <option value="zoom">Kosmik zoom</option>
            <option value="slide">Sirg'alib chiqish</option>
            <option value="flip">Aylanib chiqish</option>
          </select>
        </div>
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            if (!post.title) return;
            await fns.createPost({ data: post });
            setPost({ ...post, title: "", body: "", image_url: "" });
            refresh();
          }}
        >
          🚀 E'lon qilish
        </button>

        <div className="mt-6 space-y-3">
          {data?.posts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-primary">{p.title}</p>
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

      {/* DONATIONS */}
      <Card title="💰 Donat boshqaruvi">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={field}
            placeholder="Jami summa"
            value={settings.total_amount}
            onChange={(e) => setSettings({ ...settings, total_amount: e.target.value })}
          />
          <input
            className={field}
            placeholder="Karta raqami"
            value={settings.card_number}
            onChange={(e) => setSettings({ ...settings, card_number: e.target.value })}
          />
          <input
            className={field}
            placeholder="Karta egasi"
            value={settings.card_holder}
            onChange={(e) => setSettings({ ...settings, card_holder: e.target.value })}
          />
          <input
            className={field}
            placeholder="Mem uchish oralig'i (sekund)"
            value={settings.floater_interval_sec}
            onChange={(e) => setSettings({ ...settings, floater_interval_sec: e.target.value })}
          />
        </div>
        <button
          className="btn-vip hover:btn-vip-hover mt-4"
          onClick={async () => {
            await fns.updateSettings({
              data: {
                total_amount: Number(settings.total_amount) || 0,
                card_number: settings.card_number,
                card_holder: settings.card_holder,
                floater_interval_sec: Number(settings.floater_interval_sec) || 60,
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
              className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-2 text-xs"
            >
              <span>
                <b className="text-primary">{d.name}</b> — {uzs(d.amount)} — {d.message}
              </span>
              <button
                className="text-destructive"
                onClick={async () => {
                  await fns.deleteDonation({ data: { id: d.id } });
                  refresh();
                }}
              >
                ✕
              </button>
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
      <Card title="🛸 Uchib o'tuvchi memlar va emojilar">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <input
            className={field}
            placeholder="Emoji yoki mem matni"
            value={floater.content}
            onChange={(e) => setFloater({ ...floater, content: e.target.value })}
          />
          <select
            className={field}
            value={floater.kind}
            onChange={(e) => setFloater({ ...floater, kind: e.target.value })}
          >
            <option value="emoji">Emoji</option>
            <option value="meme">Mem kartochka</option>
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
              className="flex items-center gap-2 rounded-full border border-border/50 px-3 py-1 text-xs"
            >
              {f.content}
              <button
                className="text-destructive"
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
