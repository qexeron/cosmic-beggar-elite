import { motion, useScroll, useSpring } from "framer-motion";

/** Tepadagi oltin scroll indikatori. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: width }}
      className="fixed top-0 left-0 z-[90] h-[3px] w-full origin-left bg-gradient-to-r from-amber-300 via-yellow-200 to-fuchsia-400 shadow-[0_0_18px_rgba(251,191,36,0.8)]"
    />
  );
}
