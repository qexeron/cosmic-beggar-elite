import confetti from "canvas-confetti";

const GOLD = ["#fbbf24", "#f59e0b", "#fde68a", "#a855f7", "#ffffff"];
const MONEY = ["💵", "💸", "🪙", "💰", "👑", "💎", "🤑"];

function canDo() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Oltin konfetti + chetlardan otilish */
export function goldBurst(strength = 1) {
  if (!canDo()) return;
  confetti({
    particleCount: Math.round(120 * strength),
    spread: 100,
    origin: { y: 0.42 },
    scalar: 1.15,
    colors: GOLD,
  });
  const end = Date.now() + 1200 * strength;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors: GOLD });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors: GOLD });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Ekran bo'ylab pul yog'ishi (DOM emoji yomg'iri) */
export function moneyRain(count = 34) {
  if (!canDo()) return;
  const host = document.createElement("div");
  host.className = "fx-layer";
  document.body.appendChild(host);

  for (let i = 0; i < count; i += 1) {
    const drop = document.createElement("span");
    drop.className = "fx-drop";
    drop.textContent = MONEY[Math.floor(Math.random() * MONEY.length)] ?? "💸";
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.fontSize = `${(1.1 + Math.random() * 2).toFixed(2)}rem`;
    drop.style.animationDuration = `${(1.7 + Math.random() * 2).toFixed(2)}s`;
    drop.style.animationDelay = `${(Math.random() * 0.8).toFixed(2)}s`;
    host.appendChild(drop);
  }
  window.setTimeout(() => host.remove(), 5200);
}

/** Oltin yorug'lik yaltirashi */
export function goldFlash() {
  if (!canDo()) return;
  const flash = document.createElement("div");
  flash.className = "fx-flash";
  document.body.appendChild(flash);
  window.setTimeout(() => flash.remove(), 700);
}

/** Ekranni engil silkitish */
export function shake() {
  if (!canDo()) return;
  document.body.classList.add("fx-shake");
  window.setTimeout(() => document.body.classList.remove("fx-shake"), 520);
}

/** Bitta nuqtadan emoji sachratish (tugma ustida) */
export function emojiPop(x: number, y: number, emoji = "💸", count = 10) {
  if (!canDo()) return;
  const host = document.createElement("div");
  host.className = "fx-layer";
  document.body.appendChild(host);
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement("span");
    el.className = "fx-pop";
    el.textContent = emoji;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${(Math.random() - 0.5) * 240}px`);
    el.style.setProperty("--dy", `${-80 - Math.random() * 220}px`);
    el.style.setProperty("--rot", `${(Math.random() - 0.5) * 540}deg`);
    el.style.animationDelay = `${(Math.random() * 0.12).toFixed(2)}s`;
    host.appendChild(el);
  }
  window.setTimeout(() => host.remove(), 1800);
}

/** To'liq donat paketi: ovoz tashqarida chaqiriladi */
export function vipCelebrate() {
  goldBurst(1.2);
  moneyRain(42);
  goldFlash();
  shake();
}
