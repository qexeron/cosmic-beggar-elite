import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Kosmos chuqurligidan kelib, ekranga yaqinlashib, tepadan o'tib ketadigan bo'lim.
 * Scroll bo'yicha: scale + translateZ + rotateX + blur + brightness birga o'zgaradi.
 */
export function ZoomSection({
  children,
  id,
  className = "",
  strength = 1,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  /** 0.5 — yumshoq, 1 — standart, 1.4 — juda chuqur */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const s = Math.max(0.2, strength);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.34, 0.62, 1],
    [1 - 0.5 * s, 1, 1, 1 + 0.3 * s],
  );
  const z = useTransform(scrollYProgress, [0, 0.34, 0.62, 1], [-520 * s, 0, 0, 240 * s]);
  const rotateX = useTransform(scrollYProgress, [0, 0.34, 0.62, 1], [24 * s, 0, 0, -16 * s]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.78, 1], [0, 1, 1, 0]);
  const blurPx = useTransform(scrollYProgress, [0, 0.26, 0.74, 1], [12 * s, 0, 0, 10 * s]);
  const bright = useTransform(scrollYProgress, [0, 0.34, 0.62, 1], [0.45, 1, 1, 1.25]);
  const filter = useMotionTemplate`blur(${blurPx}px) brightness(${bright})`;

  if (reduce) {
    return (
      <section id={id} className={`relative px-4 py-20 ${className}`}>
        <div>{children}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={ref}
      className={`relative px-4 py-24 sm:py-32 ${className}`}
      style={{ perspective: "1500px" }}
    >
      <motion.div
        style={{ scale, z, rotateX, opacity, filter, transformStyle: "preserve-3d" }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </section>
  );
}
