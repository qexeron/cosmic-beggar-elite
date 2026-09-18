import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; r: number; tw: number };

/**
 * Canvasdagi uch qatlamli parallaks yulduzlar + vaqti-vaqti bilan uchar yulduz.
 * Scroll qilinganda qatlamlar turli tezlikda siljiydi — kosmos chuqurligi hissi.
 */
export function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let shootTimer = 0;
    let shoot: { x: number; y: number; life: number } | null = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      const count = Math.min(300, Math.round((window.innerWidth * window.innerHeight) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.85 + 0.15,
        r: (Math.random() * 1.5 + 0.3) * dpr,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const scroll = (window.scrollY || 0) * dpr * 0.15;

      for (const s of stars) {
        s.tw += 0.02;
        const y = (((s.y + scroll * s.z) % h) + h) % h;
        const alpha = 0.3 + Math.abs(Math.sin(s.tw)) * 0.6;
        ctx.beginPath();
        ctx.fillStyle =
          s.z > 0.8 ? `rgba(253,230,138,${alpha})` : `rgba(226,220,255,${alpha * 0.85})`;
        ctx.arc(s.x, y, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      }

      shootTimer -= 1;
      if (!shoot && shootTimer <= 0 && Math.random() < 0.004) {
        shoot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4, life: 1 };
        shootTimer = 220;
      }
      if (shoot) {
        const len = 150 * dpr * shoot.life;
        const grad = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x + len, shoot.y + len * 0.5);
        grad.addColorStop(0, `rgba(255,255,255,${shoot.life})`);
        grad.addColorStop(1, "rgba(251,191,36,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(shoot.x, shoot.y);
        ctx.lineTo(shoot.x + len, shoot.y + len * 0.5);
        ctx.stroke();
        shoot.x += 9 * dpr;
        shoot.y += 4.5 * dpr;
        shoot.life -= 0.02;
        if (shoot.life <= 0) shoot = null;
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduce) {
      draw();
      window.cancelAnimationFrame(raf);
    } else {
      draw();
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-80"
    />
  );
}
