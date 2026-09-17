import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

export function ZoomSection({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.45, 1, 1, 1.35]);
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.75, 1], [0, 1, 1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [22, 0, 0, -14]);
  const blur = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [10, 0, 0, 8]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <section
      id={id}
      ref={ref}
      className={`relative px-4 py-24 sm:py-32 ${className}`}
      style={{ perspective: "1400px" }}
    >
      <motion.div style={{ scale, opacity, rotateX, filter, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </section>
  );
}
