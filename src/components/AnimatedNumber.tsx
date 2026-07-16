"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "motion/react";

export default function AnimatedNumber({
  value,
  format = (n: number) => Math.round(n).toLocaleString(),
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18, restDelta: 0.5 });

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });

    return unsub;
  }, [spring, format]);

  return <span ref={ref}>{format(0)}</span>;
}