import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ZoomSection } from "@/components/zoom-section";
import { Floaters } from "@/components/floaters";
import { StarField } from "@/components/star-field";
import { ScrollProgress } from "@/components/scroll-progress";
import { Marquee } from "@/components/marquee";
import { Tilt } from "@/components/tilt";
import { CountUp } from "@/components/count-up";
import { AnimatedSticker, isSticker } from "@/components/animated-sticker";
import { useLiveSite } from "@/hooks/use-live-site";
import { donatePublic } from "@/lib/admin.functions";
import {
  SITE_QUERY_KEY,
  uzs,
  DEFAULT_HERO_LINES,
  DEFAULT_THANKS_LINES,
  type Post,
  type Comment,
  type Donation,
  type PostAnimation,
} from "@/lib/site-data";
import { goldBurst, moneyRain, goldFlash, shake, emojiPop } from "@/lib/fx";
import { playCash, setSoundEnabled } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TILANCHI.UZ — VIP Luxury Begging Experience 💎" },
      {
        name: "description",
        content:
          "Kosmik dizaynli, oltin rangli VIP tilanchilik platformasi: mem yangiliklar, donat-xona va kulgili otzivlar.",
      },
      { property: "og:title", content: "TILANCHI.UZ — VIP Tilanchilik Klubi 👑" },
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

const PRESETS = [5000, 20000, 100000, 1000000];

const ZOOM_STRENGTH: Record<PostAnimation, number> = {
  zoom: 1,
  slide: 0.8,
  flip: 1.15,
  glitch: 0.6,
};

/** Adds `anim-{animation}` only once, the first time the element scrolls into view. */
function useRevealClass(animation: PostAnimation) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reducedMotion) return { ref, className: "" };
  return { ref, className: revealed ? `anim-${animation}` : "opacity-0" };
}

function Landing() {
  const { data } = useLiveSite();
  const qc = useQueryClient();
  const donate = useServerFn(donatePublic);

  const [heroIndex, setHeroIndex] = useState(0);
  const [thanks, setThanks] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);

  const [donorName, setDonorName] = useState("");
  const [donorAmount, setDonorAmount] = useState<number | "">("");
  const [donorMsg, setDonorMsg] = useState("");
  const [donateBusy, setDonateBusy] = useState(false);
  const [donateError, setDonateError] = useState("");

  const settings = data?.settings;
  const posts = data?.posts ?? [];
  const comments = data?.comments ?? [];
  const reviews = data?.reviews ?? [];
  const donations = data?.donations ?? [];
  const heroLines = settings?.hero_lines.length ? settings.hero_lines : DEFAULT_HERO_LINES;
  const thanksLines = settings?.thanks_lines.length ? settings.thanks_lines : DEFAULT_THANKS_LINES;
  const publicDonationsOn = settings?.public_donations ?? true;

  useEffect(() => {
    const t = window.setInterval(() => setHeroIndex((i) => (i + 1) % heroLines.length), 3800);
    return () => window.clearInterval(t);
  }, [heroLines.length]);

  useEffect(() => {
    setSoundEnabled(settings?.sound_enabled ?? true);
  }, [settings?.sound_enabled]);

  function celebrate(e?: React.MouseEvent) {
    goldBurst(1);
    moneyRain(30);
    goldFlash();
    shake();
    if (e) emojiPop(e.clientX, e.clientY, "💸", 8);
    if (settings?.sound_enabled ?? true) playCash();
    setShowCard(true);
    setThanks(thanksLines[Math.floor(Math.random() * thanksLines.length)] ?? thanksLines[0]!);
    window.setTimeout(() => setThanks(null), 4200);
  }

  function pickPreset(a: number) {
    setDonorAmount(a);
  }

  async function submitDonation(e: React.FormEvent) {
    e.preventDefault();
    setDonateError("");

    const name = donorName.trim();
    const amount = Number(donorAmount);
    const msg = donorMsg.trim();

    if (!name) {
      setDonateError("Iltimos, ismingiz yoki taxallusingizni kiriting!");
      return;
    }
    if (!amount || amount < 1000) {
      setDonateError("Kamida 1 000 so'm kiriting 🙂");
      return;
    }
    if (!msg) {
      setDonateError("Iltimos, xabar maydonini to'ldiring!");
      return;
    }

    setDonateBusy(true);
    try {
      await donate({ data: { name, amount, message: msg } });
      setShowCard(true);
      celebrate();
      setDonorName("");
      setDonorAmount("");
      setDonorMsg("");
      void qc.invalidateQueries({ queryKey: SITE_QUERY_KEY });
    } catch (err) {
      setShowCard(true);
      celebrate();
      setDonorName("");
      setDonorAmount("");
      setDonorMsg("");
      console.warn("Donation logging note:", err);
    } finally {
      setDonateBusy(false);
    }
  }

  async function copyCard() {
    if (!settings) return;
    await navigator.clipboard.writeText(settings.card_number.replace(/\s/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <StarField />
      <Floaters items={data?.floaters ?? []} intervalSec={settings?.floater_interval_sec ?? 25} />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
            <img
              src="/logo.png"
              alt="Tilanchi Dev"
              className="h-7 sm:h-9 w-auto object-contain"
            />
            <span className="font-display text-base font-black gold-text sm:text-xl tracking-tight hidden xs:inline">
              Tilanchi.uz
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="https://t.me/tilanchiuz"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-gold hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm"
            >
              <span>✈️ Telegram</span>
            </a>
            <a
              href="https://instagram.com/tilanchiuz"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-gold hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm"
            >
              <span>📷 Instagram</span>
            </a>
            <a href="#donat" className="btn-ghost-gold px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
              💸 Donat
            </a>
            <Link to="/admin" className="btn-ghost-gold px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
              🔐 Admin
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[80vh] items-center justify-center px-4 text-center">
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
            <span className="glitch gold-text" data-text="TILANCHI BU —">
              TILANCHI BU —
            </span>
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
                {heroLines[heroIndex % heroLines.length]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground sm:text-base">
            Koinotdagi eng lyuks va VIP tilanchilik platformasiga xush kelibsiz. Bizda har bir karta
            raqami olmos bilan qoplangan! 💎
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#donat" className="btn-vip hover:btn-vip-hover">
              🚀 EHSON QILISH (VIP)
            </a>
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

      <Marquee text={settings?.marquee_text ?? "TILANCHI.UZ • VIP KLUB"} />

      {/* LIVE STAT STRIP */}
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 py-10 sm:grid-cols-4">
        <StatCard label="Jami soqqa" value={<CountUp value={settings?.total_amount ?? 0} className="gold-glow" />} />
        <StatCard label="Saxiylar" value={String(donations.length)} />
        <StatCard label="Kosmik postlar" value={String(posts.length)} />
        <StatCard
          label="Jonli"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="live-dot" /> ON
            </span>
          }
        />
      </div>

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
        <Tilt max={4} className="mx-auto max-w-3xl">
          <div className="conic-sheen glass rounded-3xl p-8 text-center sm:p-12">
            <div className="text-xs font-bold tracking-widest text-primary">💰 VIP EHSON ZONASI</div>
            <h2 className="mt-2 font-display text-3xl font-black gold-text sm:text-5xl">
              DONAT-XONA
            </h2>

            <p className="mt-8 text-sm text-muted-foreground">Jami yig'ilgan soqqa (so'mda):</p>
            <div className="font-display mt-2 text-3xl font-black gold-glow sm:text-5xl">
              <CountUp value={settings?.total_amount ?? 0} suffix=" UZS" />
            </div>

            {publicDonationsOn ? (
              <form onSubmit={submitDonation} className="mt-8 text-left">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PRESETS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => pickPreset(a)}
                      className={`rounded-2xl gold-ring px-3 py-4 text-sm font-bold transition hover:scale-105 ${
                        donorAmount === a ? "btn-vip" : "bg-secondary/40 text-primary"
                      }`}
                    >
                      {uzs(a)}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    maxLength={60}
                    placeholder="Ismingiz (yoki taxallus)"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={donorAmount}
                    onChange={(e) => setDonorAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    type="number"
                    min={1000}
                    max={1000000000}
                    placeholder="Summa (so'm)"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <input
                  value={donorMsg}
                  onChange={(e) => setDonorMsg(e.target.value)}
                  maxLength={160}
                  placeholder="Yumorli xabar (ixtiyoriy)"
                  className="mt-3 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
                />

                {donateError && <p className="mt-3 text-center text-xs text-destructive">{donateError}</p>}

                <button
                  type="submit"
                  disabled={donateBusy}
                  onClick={(e) => e.currentTarget.blur()}
                  className="btn-vip hover:btn-vip-hover mt-5 w-full disabled:opacity-60"
                >
                  {donateBusy ? "⏳ Yuborilmoqda…" : "💸 DONAT QILISH VA VIP BO'LISH"}
                </button>
              </form>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">
                Ochiq donat hozircha yopiq — faqat admin yozuv qo'shmoqda. 😌
              </p>
            )}

            {settings?.donate_note && (
              <p className="mt-6 text-[11px] text-muted-foreground">{settings.donate_note}</p>
            )}

            {showCard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 rounded-3xl gold-ring bg-secondary/30 p-6"
              >
                <p className="text-xs tracking-widest text-muted-foreground">HUMO / VIP KARTA</p>
                <p className="font-display mt-2 text-lg sm:text-2xl font-black tracking-wider sm:tracking-[0.2em] gold-glow select-all break-all">
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
              {donations.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Hali hech kim donat qilmadi. Birinchi bo'lish imkoniyati! 🥇
                </p>
              )}
              {donations.map((d) => (
                <DonorRow key={d.id} d={d} />
              ))}
            </div>
          </div>
        </Tilt>
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
              >
                <Tilt max={6} className="glass h-full rounded-3xl p-6">
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
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </ZoomSection>

      <Marquee text={settings?.marquee_text ?? "TILANCHI.UZ • VIP KLUB"} reverse />

      <footer className="relative border-t border-border/40 py-10 text-center">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://t.me/tilanchiuz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-gold inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm"
          >
            <span>✈️ Telegram: @tilanchiuz</span>
          </a>
          <a
            href="https://instagram.com/tilanchiuz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-gold inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm"
          >
            <span>📷 Instagram: @tilanchiuz</span>
          </a>
        </div>
        <p className="font-display text-sm font-bold gold-text">TILANCHI.UZ © 2026</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Barcha huquqlar shaffof va oltin rangda himoyalangan. Yumor maqsadida yaratilgan. 😉
        </p>
        {settings?.donate_note && (
          <p className="mt-1 text-[11px] text-muted-foreground/80">{settings.donate_note}</p>
        )}
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

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="font-display text-lg font-black text-primary sm:text-2xl">{value}</div>
      <div className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase sm:text-xs">
        {label}
      </div>
    </div>
  );
}

function DonorRow({ d }: { d: Donation }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/40 px-4 py-3"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-bold text-primary">
          <span className="truncate">{d.name}</span>
          <span className="shrink-0 rounded-full gold-ring px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
            {d.source === "public" ? "🌍 mehmon" : "👑 admin"}
          </span>
        </p>
        {d.message && <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.message}</p>}
      </div>
      <span className="font-display shrink-0 text-sm font-black whitespace-nowrap text-primary">
        {uzs(d.amount)}
      </span>
    </motion.div>
  );
}

function PostMedia({ post }: { post: Post }) {
  const kind = post.media_kind;
  const url = post.media_url ?? post.image_url;

  if (kind === "video" && url) {
    return (
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-90"
        />
        <span className="absolute top-3 right-3 rounded-full bg-background/70 px-2 py-1 text-[10px] font-bold tracking-widest text-primary">
          VIDEO
        </span>
      </div>
    );
  }

  if ((kind === "image" || kind === "gif") && url) {
    return (
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <img
          src={url}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover opacity-85 transition duration-700 hover:scale-105"
          onError={(e) => {
            e.currentTarget.closest("[data-media]")?.classList.add("hidden");
          }}
        />
        {kind === "gif" && (
          <span className="absolute top-3 right-3 rounded-full bg-background/70 px-2 py-1 text-[10px] font-bold tracking-widest text-primary">
            GIF
          </span>
        )}
      </div>
    );
  }

  if (isSticker(post.sticker)) {
    return (
      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-secondary/30 to-background/60 sm:h-48">
        <AnimatedSticker name={post.sticker} size="text-7xl" />
      </div>
    );
  }

  return null;
}

function PostSection({ post, comments }: { post: Post; comments: Comment[] }) {
  const [open, setOpen] = useState(false);
  const reveal = useRevealClass(post.animation);
  const hasMedia =
    Boolean(post.media_url ?? post.image_url) || isSticker(post.sticker);

  return (
    <ZoomSection strength={post.pinned ? 1.3 : ZOOM_STRENGTH[post.animation]}>
      <div ref={reveal.ref} className={reveal.className}>
        <Tilt max={2} className="mx-auto max-w-4xl">
          <article
            data-media
            className={`glass overflow-hidden rounded-3xl ${post.pinned ? "gold-ring" : ""}`}
          >
            {post.pinned && (
              <div className="flex items-center gap-2 bg-primary/10 px-6 py-2 text-[11px] font-bold tracking-widest text-primary">
                📌 MAXSUS E'LON
              </div>
            )}
            {hasMedia && <PostMedia post={post} />}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full gold-ring px-3 py-1 font-bold text-primary">
                  {post.badge}
                </span>
                <span className="text-muted-foreground">
                  {new Date(post.created_at).toISOString().slice(0, 16).replace("T", " ")}
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
        </Tilt>
      </div>
    </ZoomSection>
  );
}
