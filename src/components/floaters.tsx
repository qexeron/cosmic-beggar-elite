import { useEffect, useState } from "react";

type Floater = { id: string; content: string; kind: string };
type Flying = { key: number; content: string; kind: string; top: number; duration: number };

export function Floaters({
  items,
  intervalSec = 60,
}: {
  items: Floater[];
  intervalSec?: number;
}) {
  const [flying, setFlying] = useState<Flying[]>([]);

  useEffect(() => {
    if (!items.length) return;
    let counter = 0;

    const spawn = () => {
      const item = items[Math.floor(Math.random() * items.length)];
      if (!item) return;
      counter += 1;
      const entry: Flying = {
        key: counter + Date.now(),
        content: item.content,
        kind: item.kind,
        top: 10 + Math.random() * 70,
        duration: 9 + Math.random() * 6,
      };
      setFlying((prev) => [...prev, entry]);
      window.setTimeout(
        () => setFlying((prev) => prev.filter((f) => f.key !== entry.key)),
        entry.duration * 1000 + 500,
      );
    };

    const first = window.setTimeout(spawn, 2500);
    const timer = window.setInterval(spawn, Math.max(5, intervalSec) * 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [items, intervalSec]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {flying.map((f) => (
        <div
          key={f.key}
          className="absolute left-0 whitespace-nowrap"
          style={{
            top: `${f.top}%`,
            animation: `drift-across ${f.duration}s linear forwards`,
          }}
        >
          {f.kind === "emoji" ? (
            <span className="text-5xl drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              {f.content}
            </span>
          ) : (
            <span className="glass rounded-full px-5 py-3 text-sm font-bold text-primary">
              {f.content}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
