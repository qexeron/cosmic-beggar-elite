import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

import { ZoomSection } from "@/components/zoom-section";
import { Floaters } from "@/components/floaters";
import { siteQuery, uzs, type Post, type Comment } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TILANCHILIK.UZ — VIP Luxury Begging Experience 💎" },
      {
        name: "description",
        content:
          "Kosmik dizaynli, oltin rangli VIP tilanchilik platformasi: mem yangiliklar, donat-xona va kulgili otzivlar.",
      },
      { property: "og:title", content: "TILANCHILIK.UZ — VIP Tilanchilik Klubi 👑" },
      {
        property: "og:description",
        content: "Koinotdagi eng lyuks donat tajribasi. Yumor, oltin va kosmos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const HERO_LINES = [
  "Tilanchi bu — shunchaki kasb emas, bu san'at!",
  "Siz bergan 1000 so'm — bizning VIP kelajagimiz.",
  "Biz so'ramaymiz, biz taklif qilamiz: hamkorlik 💎",
  "Karta raqamimiz olmos bilan qoplangan, ehtiyot bo'ling!",
];

const THANKS = [
  "Siz rasman VIP saxiysiz! 👑",
  "Koinot sizga qaytaradi (ehtimol) ✨",
  "Bizning bosh tilanchimiz sizga ta'zim qilmoqda 🙇",
  "Sizning ismingiz oltin ro'yxatga yozildi 📜",
];

function moneyShower() {
  const end = Date.now() + 1400;
  const colors = ["#fbbf24", "#f59e0b", "#a855f7", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 140, spread: 100, origin: { y: 0.4 }, scalar: 1.2, colors });
}

function Landing() {
  const { data } = useQuery(siteQuery);
  const [heroIndex, setHeroIndex] = useState(0);
  const [thanks, setThanks] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setHeroIndex((i) => (i + 1) % HERO_LINES.length), 3800);
    return () => window.clearInterval(t);
  }, []);

  const settings = data?.settings;
  const posts = data?.posts ?? [];
  const comments = data?.comments ?? [];
  const reviews = data?.reviews ?? [];
  const donations = data?.donations ?? [];

  function donate() {
    moneyShower();
    setShowCard(true);
    setThanks(THANKS[Math.floor(Math.random() * THANKS.length)] ?? THANKS[0]!);
    window.setTimeout(() => setThanks(null), 4200);
  }

  async function copyCard() {
    if (!settings) return;
    await navigator.clipboard.writeText(settings.card_number.replace(/\s/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen">
      <div className="star-field pointer-events-none fixed inset-0 opacity-60" />
      <Floaters items={data?.floaters ?? []} intervalSec={settings?.floater_interval_sec ?? 60} />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <span className="font-display text-lg font-black gold-text sm:text-xl">
              TILANCHILIK.UZ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#donat" className="btn-ghost-gold px-4 py-2 text-xs sm:text-sm">
              💸 Donat
            </a>
            <Link to="/admin" className="btn-ghost-gold px-4 py-2 text-xs sm:text-sm">
              🔐 Admin
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mx-auto mb-6 inline-block rounded-full px-5 py-2 text-xs font-bold tracking-widest gold-ring text-primary"
          >
            ✨ VIP BEGGING CLUB ✨
          </motion.div>

          <h1 className="font-display text-4xl leading-tight font-black sm:text-6xl">
            <span className="gold-text">TILANCHI BU —</span>
          </h1>

          <div className="mt-4 flex min-h-[5.5rem] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={heroIndex}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                transition={{ duration: 0.6 }}
                className="font-display text-xl font-bold gold-glow sm:text-3xl"
              >
                {HERO_LINES[heroIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground sm:text-base">
            Koinotdagi eng lyuks va VIP tilanchilik platformasiga xush kelibsiz. Bizda har bir karta
            raqami olmos bilan qoplangan! 💎
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button onClick={donate} className="btn-vip hover:btn-vip-hover">
              🚀 EHSON QILISH (VIP)
            </button>
            <a href="#yangiliklar" className="btn-ghost-gold">
              📜 Mem xabarlar
            </a>
          </div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-14 text-2xl text-primary"
          >
            ⌄
          </motion.div>
        </div>
      </section>

      {/* FEED */}
      <div id="yangiliklar" />
      {posts.map((post) => (
        <PostSection
          key={post.id}
          post={post}
          comments={comments.filter((c) => c.post_id === post.id)}
        />
      ))}

      {/* DONAT */}
      <ZoomSection id="donat">
        <div className="mx-auto max-w-3xl glass rounded-3xl p-8 text-center sm:p-12">
          <div className="text-xs font-bold tracking-widest text-primary">💰 VIP EHSON ZONASI</div>
          <h2 className="mt-2 font-display text-3xl font-black gold-text sm:text-5xl">
            DONAT-XONA
          </h2>

          <p className="mt-8 text-sm text-muted-foreground">Jami yig'ilgan soqqa (so'mda):</p>
          <div className="font-display mt-2 text-3xl font-black gold-glow sm:text-5xl">
            {uzs(settings?.total_amount ?? 0)} UZS
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[5000, 20000, 100000, 1000000].map((a) => (
              <button
                key={a}
                onClick={donate}
                className="rounded-2xl gold-ring bg-secondary/40 px-3 py-4 text-sm font-bold text-primary transition hover:scale-105"
              >
                {uzs(a)}
              </button>
            ))}
          </div>

          <button onClick={donate} className="btn-vip hover:btn-vip-hover mt-8 w-full sm:w-auto">
            💸 DONAT QILISH
          </button>

          {showCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl gold-ring bg-secondary/30 p-6"
            >
              <p className="text-xs tracking-widest text-muted-foreground">HUMO / VIP KARTA</p>
              <p className="font-display mt-2 text-xl font-black tracking-[0.2em] gold-glow sm:text-2xl">
                {settings?.card_number}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{settings?.card_holder}</p>
              <button onClick={copyCard} className="btn-ghost-gold mt-4 text-xs">
                {copied ? "✅ Nusxa olindi" : "📋 Raqamdan nusxa olish"}
              </button>
            </motion.div>
          )}

          <div className="mt-10 space-y-3 text-left">
            <p className="text-center text-xs tracking-widest text-muted-foreground">
              OXIRGI SAXIYLAR
            </p>
            {donations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-primary">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.message}</p>
                </div>
                <span className="font-display text-sm font-black whitespace-nowrap text-primary">
                  {uzs(d.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ZoomSection>

      {/* REVIEWS */}
      <ZoomSection>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-2xl font-black gold-text sm:text-4xl">
            💬 VIP MIJOZLAR SHARHLARI
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Bizga ishongan mashhur tilanchilar va donaterlar otzivlari
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass rounded-3xl p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gold-ring text-2xl">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-primary">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-foreground/85 italic">"{r.body}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </ZoomSection>

      <footer className="relative border-t border-border/40 py-10 text-center">
        <p className="font-display text-sm font-bold gold-text">TILANCHILIK.UZ © 2026</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Barcha huquqlar shaffof va oltin rangda himoyalangan. Yumor maqsadida yaratilgan. 😉
        </p>
      </footer>

      <AnimatePresence>
        {thanks && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="fixed bottom-8 left-1/2 z-[80] -translate-x-1/2 glass rounded-full px-6 py-4 text-center text-sm font-bold text-primary"
          >
            {thanks}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostSection({ post, comments }: { post: Post; comments: Comment[] }) {
  const [open, setOpen] = useState(false);
  return (
    <ZoomSection>
      <article className="mx-auto max-w-4xl glass overflow-hidden rounded-3xl">
        {post.image_url && (
          <div className="h-56 w-full overflow-hidden sm:h-72">
            <img
              src={post.image_url}
              alt={post.title}
              className="h-full w-full object-cover opacity-85 transition duration-700 hover:scale-105"
            />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full gold-ring px-3 py-1 font-bold text-primary">
              {post.badge}
            </span>
            <span className="text-muted-foreground">
              {new Date(post.created_at).toLocaleString("uz-UZ")}
            </span>
          </div>
          <h3 className="mt-4 font-display text-xl font-black gold-text sm:text-3xl">
            {post.title}
          </h3>
          <p className="mt-3 text-sm text-foreground/80 sm:text-base">{post.body}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="text-primary">❤️ {post.likes} layk</span>
            <span>👁 {post.views} ko'rildi</span>
            <button onClick={() => setOpen((o) => !o)} className="btn-ghost-gold px-4 py-2 text-xs">
              💬 Izohlar ({comments.length})
            </button>
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 space-y-3 overflow-hidden"
              >
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground">Hali izoh yo'q.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                    <p className="text-xs font-bold text-primary">{c.author}</p>
                    <p className="mt-1 text-sm text-foreground/80">{c.body}</p>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground">
                  ✍️ Izohlarni faqat admin yozadi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </ZoomSection>
  );
}
