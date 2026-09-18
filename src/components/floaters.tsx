import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatedSticker } from "./animated-sticker";

type Floater = { id: string; content: string; kind: string };

type Flying = {
  key: number;
  content: string;
  kind: string;
  top: number;
  duration: number;
  path: "rtl" | "ltr" | "diagonal" | "wave";
  scale: number;
};

const PATH_CLASS: Record<Flying["path"], string> = {
  rtl: "drift-rtl",
  ltr: "drift-ltr",
  diagonal: "drift-diagonal",
  wave: "drift-wave",
};

/**
 * Ekran ustida uchib o'tadigan memlar, emojilar, stikerlar va GIFlar.
 * - chastota adminda sozlanadi (floater_interval_sec)
 * - yo'nalish va traektoriya har safar random
 * - sahifa fon rejimida (tab yashirin) hech narsa chiqmaydi
 */
export function Floaters({ items, intervalSec = 25 }: { items: Floater[]; intervalSec?: number }) {
  const [flying, setFlying] = useState<Flying[]>([]);
  const counter = useRef(0);
  const pool = useMemo(() => items.filter((i) => i.content?.trim()), [items]);

  useEffect(() => {
    if (!pool.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const paths: Flying["path"][] = ["rtl", "rtl", "ltr", "diagonal", "wave"];

    const spawn = () => {
      if (document.hidden) return;
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (!item) return;
      counter.current += 1;
      const entry: Flying = {
        key: counter.current,
        content: item.content,
        kind: item.kind,
        top: 8 + Math.random() * 72,
        duration: 9 + Math.random() * 7,
        path: paths[Math.floor(Math.random() * paths.length)] ?? "rtl",
        scale: 0.8 + Math.random() * 0.6,
      };
      setFlying((prev) => [...prev.slice(-5), entry]);
      window.setTimeout(
        () => setFlying((prev) => prev.filter((f) => f.key !== entry.key)),
        entry.duration * 1000 + 600,
      );
    };

    const first = window.setTimeout(spawn, 2200);
    const timer = window.setInterval(spawn, Math.max(4, intervalSec) * 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [pool, intervalSec]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {flying.map((f) => (
        <div
          key={f.key}
          className={`absolute left-0 whitespace-nowrap ${PATH_CLASS[f.path]}`}
          style={{
            top: `${f.top}%`,
            animationDuration: `${f.duration}s`,
            transform: `scale(${f.scale})`,
          }}
        >
          {f.kind === "emoji" && (
            <span className="text-5xl drop-shadow-[0_0_22px_rgba(251,191,36,0.65)]">
              {f.content}
            </span>
          )}

          {f.kind === "sticker" && <AnimatedSticker name={f.content} size="text-6xl" />}

          {f.kind === "gif" && (
            <img
              src={f.content}
              alt=""
              loading="lazy"
              className="h-28 w-auto rounded-2xl gold-ring object-cover shadow-[0_0_35px_rgba(251,191,36,0.35)]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {f.kind === "meme" && (
            <span className="glass inline-block max-w-[80vw] rounded-full px-5 py-3 text-sm font-bold text-primary">
              {f.content}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
