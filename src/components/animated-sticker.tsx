/**
 * "GIF"ga o'xshash, lekin sof CSS bilan ishlaydigan animatsion stikerlar.
 * Tashqi fayl yuklanmaydi — hech qachon buzilmaydi va tez ishlaydi.
 */
export const STICKERS = {
  coin: { emoji: "🪙", cls: "sticker-flip", label: "Aylanuvchi tanga" },
  money: { emoji: "💸", cls: "sticker-fly", label: "Uchayotgan pul" },
  rocket: { emoji: "🚀", cls: "sticker-rocket", label: "Raketa" },
  crown: { emoji: "👑", cls: "sticker-bounce", label: "Sakrayotgan toj" },
  hand: { emoji: "🤲", cls: "sticker-beg", label: "Cho'zilgan qo'l" },
  diamond: { emoji: "💎", cls: "sticker-pulse", label: "Yaltiroq olmos" },
  cash: { emoji: "🤑", cls: "sticker-shake", label: "Soqqa yuz" },
  ufo: { emoji: "🛸", cls: "sticker-hover", label: "UFO" },
} as const;

export type StickerName = keyof typeof STICKERS;

export function isSticker(name: string | null | undefined): name is StickerName {
  return !!name && name in STICKERS;
}

export function AnimatedSticker({
  name,
  className = "",
  size = "text-6xl",
}: {
  name: string;
  className?: string;
  size?: string;
}) {
  const sticker = isSticker(name) ? STICKERS[name] : STICKERS.coin;
  return (
    <span
      role="img"
      aria-label={sticker.label}
      className={`sticker-base ${sticker.cls} ${size} ${className}`}
    >
      {sticker.emoji}
    </span>
  );
}
