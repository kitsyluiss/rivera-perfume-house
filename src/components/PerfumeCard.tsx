"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Perfume } from "@/lib/types";
import { formatPhp } from "@/lib/format";
import { inferPerfumeTag } from "@/lib/perfume-tags";

const ease = [0.22, 1, 0.36, 1] as const;

// Detect touch-primary devices once at module load — avoids per-render checks.
// On touch devices we skip the 3D tilt entirely: it has no effect without a
// mouse and can cause subpixel transform shifts that break tap hit-testing on
// the last card in the grid.
const isTouchDevice =
  typeof window !== "undefined" &&
  (navigator.maxTouchPoints > 0 || "ontouchstart" in window);

export default function PerfumeCard({
  perfume,
  index,
  onClick,
}: {
  perfume: Perfume;
  index: number;
  onClick?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [clickedGlow, setClickedGlow] = useState(false);
  const inStock = perfume.quantity > 0;
  const tag = inferPerfumeTag(perfume);

  const handleTap = () => {
    setClickedGlow(true);
    setTimeout(() => setClickedGlow(false), 800);
    onClick?.();
  };

  // --- 3D tilt (mouse-only) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 250,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 250,
    damping: 25,
  });

  const handleMouse = (event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetMouse = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Only apply perspective tilt on non-touch (pointer) devices
  const tiltStyle = isTouchDevice
    ? {}
    : { rotateX, rotateY, transformPerspective: 900 };

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.07, 0.56), ease }}
      onMouseMove={isTouchDevice ? undefined : handleMouse}
      onMouseLeave={isTouchDevice ? undefined : resetMouse}
      onClick={handleTap}
      style={tiltStyle}
      // On touch devices we skip the 3D tilt entirely: it has no effect without a
      // mouse and can cause subpixel transform shifts that break tap hit-testing on
      // the last card in the grid.
      className={`card-shimmer group relative cursor-pointer overflow-hidden rounded-[1.1rem] border border-border bg-card transition-[border-color] duration-500 hover:border-primary/25 ${
        clickedGlow ? "is-glowing" : ""
      } ${!inStock ? "opacity-50 grayscale" : ""}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {perfume.image_url ? (
          <motion.div className="relative h-full w-full" whileHover={{ scale: 1.06 }} transition={{ duration: 0.65, ease }}>
            <Image
              src={perfume.image_url}
              alt={`${perfume.brand} ${perfume.scent_name}`}
              fill
              // 2-col mobile → each card is ~50vw; 3-col tablet → ~33vw; 4-col desktop → 25vw
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              // Eagerly load first 4 cards; lazy-load the rest
              priority={index < 4}
              loading={index < 4 ? "eager" : "lazy"}
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/30">
            No image
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/60 to-transparent pointer-events-none" />

        <div className="absolute bottom-2 left-2 z-10 rounded-full bg-card/85 px-2 py-0.5 text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-muted-foreground backdrop-blur-md">
          {tag}
        </div>
      </div>

      <div className="relative z-10 -mt-2 p-3 pb-4.5 sm:p-5">
        <motion.div initial={false} whileHover={{ y: -3 }} transition={{ duration: 0.3, ease }}>
          <p className="mb-1 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-primary font-body">
            {perfume.brand}
          </p>
          <h3 className="mb-1.5 text-sm font-medium leading-snug text-foreground font-display sm:text-[1.25rem] truncate">
            {perfume.scent_name}
          </h3>
          <div className="flex items-end justify-between">
            <p className="font-display text-base leading-none text-foreground sm:text-2xl">
              {formatPhp(perfume.target_sale_price)}
            </p>
            <motion.span initial={{ opacity: 0, x: -6 }} whileHover={{ opacity: 1, x: 0 }} className="hidden text-[10px] uppercase tracking-[0.15em] text-primary font-body sm:block">
              View →
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}