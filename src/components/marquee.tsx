/** Cheksiz aylanadigan oltin lenta (yozuvlar tasmasi). */
export function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const chunk = text.trim() || "TILANCHILIK.UZ";
  return (
    <div className="marquee-wrap border-y border-border/40 bg-background/40 py-3 backdrop-blur-md">
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="font-display px-6 text-xs font-black tracking-[0.25em] text-primary/90 sm:text-sm"
          >
            {chunk} •{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
