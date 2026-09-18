/** Kichik WebAudio effektlari — hech qanday tashqi audio fayl kerak emas. */

let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setSoundEnabled(enabled: boolean) {
  muted = !enabled;
}

function tone(freq: number, at: number, dur: number, gain = 0.14, type: OscillatorType = "triangle") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(0, ac.currentTime + at);
  vol.gain.linearRampToValueAtTime(gain, ac.currentTime + at + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + at + dur);
  osc.connect(vol);
  vol.connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.05);
}

/** Kassa / oltin jaranglashi — donat bosilganda */
export function playCash() {
  [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, i * 0.07, 0.45, 0.15));
  tone(523, 0.02, 0.8, 0.08, "sine");
}

/** Tanga tovushi — kichik bosishlar uchun */
export function playCoin() {
  tone(1760, 0, 0.12, 0.1);
  tone(2637, 0.06, 0.18, 0.07);
}

/** Yumshoq "pop" — izoh ochilishi, reaksiya */
export function playPop() {
  tone(880, 0, 0.09, 0.07, "sine");
}
