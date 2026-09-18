import { useEffect, useRef, useState } from "react";

import { uzs } from "@/lib/site-data";

/** Raqamni silliq sanab chiqadigan komponent (jami summa, statistika). */
export function CountUp({
  value,
  duration = 1100,
  suffix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    const delta = value - begin;
    if (delta === 0) return;

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(begin + delta * eased);
      if (p < 1) raf.current = window.requestAnimationFrame(step);
      else from.current = value;
    };
    raf.current = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return (
    <span className={className}>
      {uzs(shown)}
      {suffix}
    </span>
  );
}
