"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { Perfume } from "@/lib/types";
import { formatPhp } from "@/lib/format";
import { inferPerfumeTag } from "@/lib/perfume-tags";
import { useCountdown } from "@/hooks/useCountdown";
import { getAvifUrl, getPngUrl } from "@/lib/get-avif";

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
  isSelected,
  onClick,
}: {
  perfume: Perfume;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [clickedGlow, setClickedGlow] = useState(false);
  const inStock = perfume.quantity > 0;
  const tag = inferPerfumeTag(perfume);
  
  const hasFlashSale = perfume.flash_sale_price != null && 
    perfume.flash_sale_end != null && 
    new Date(perfume.flash_sale_end) > new Date() &&
    (perfume.flash_sale_stock == null || perfume.flash_sale_stock > 0);
    
  const { timeLeft, isExpired } = useCountdown(hasFlashSale ? perfume.flash_sale_end! : null);

  const displayPrice = hasFlashSale && !isExpired ? perfume.flash_sale_price! : perfume.target_sale_price;
  const percentOff = hasFlashSale && !isExpired
    ? Math.round(((perfume.target_sale_price - displayPrice) / perfume.target_sale_price) * 100) 
    : 0;

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

  // Only apply perspective tilt on non-touch (pointer) devices when not selected
  const tiltStyle = isTouchDevice || isSelected
    ? {}
    : { rotateX, rotateY, transformPerspective: 900 };

  // --- Scroll Parallax ---
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [isTouchDevice ? 15 : 30, isTouchDevice ? -15 : -30]);
  const textY = useTransform(scrollYProgress, [0, 1], [isTouchDevice ? 5 : 10, isTouchDevice ? -5 : -10]);

  return (
    <motion.article
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${perfume.brand} ${perfume.scent_name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTap();
        }
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.04, 0.4), ease }}
      onMouseMove={isTouchDevice ? undefined : handleMouse}
      onMouseLeave={isTouchDevice ? undefined : resetMouse}
      onClick={handleTap}
      style={{
        ...tiltStyle,
        willChange: "transform, opacity",
      }}
      className={`card-shimmer group relative cursor-pointer overflow-hidden rounded-[1.1rem] border border-border bg-card transition-[border-color] duration-500 hover:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${
        clickedGlow ? "is-glowing" : ""
      } ${!inStock ? "opacity-50 grayscale" : ""}`}
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-secondary">
        {(() => {
          const cardImage = perfume.image_url || getPngUrl(perfume);
          const hasImage = Boolean(cardImage || getAvifUrl(perfume) !== "/logo.svg");

          return hasImage ? (
            <div className={`relative h-full w-full flex items-center justify-center ${isSelected ? "" : "group-hover:scale-105 transition-transform duration-700 ease-out"}`}>
              
              {/* 1. Hidden Isolated Bottle (Strict layoutId origin) */}
              {/* Elevated to z-20 when selected so Framer Motion cleanly morphs without clipping beneath */}
              <motion.img
                layoutId={`bottle-${perfume.id}`}
                src={getAvifUrl(perfume)}
                alt={`${perfume.brand} ${perfume.scent_name}`}
                className={`absolute inset-0 m-auto h-[85%] w-full object-contain ${isSelected ? "z-20" : "z-0"}`}
                style={{ willChange: "transform" }}
                transition={{ type: "spring", stiffness: 75, damping: 18, mass: 1.1 }}
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
              />

              {/* 2. Unaltered Catalog Environment Photo (Fades out when selected) */}
              {cardImage && (
                <motion.div 
                  style={{ y: imageY, scale: 1.15 }}
                  animate={{ opacity: isSelected ? 0 : 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-10"
                >
                  <img src={cardImage} alt="" className="h-full w-full object-cover" />
                </motion.div>
              )}
              
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/30">
              No image
            </div>
          );
        })()}

        {/* Shadow Gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/60 to-transparent pointer-events-none z-10" />

        {/* Category Tag (Bottom Left) */}
        <div className="absolute bottom-2 left-2 z-10">
          <div className="rounded-full bg-card/95 px-2 py-0.5 text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-muted-foreground shadow-sm">
            {tag}
          </div>
        </div>

        {/* Flash Sale Details (Top Left) */}
        {hasFlashSale && !isExpired && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 sm:flex-row sm:items-center">
            <div className="rounded-full bg-primary/95 px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-primary-foreground shadow-sm flex items-center gap-1 w-max">
              {perfume.flash_sale_name && <span>{perfume.flash_sale_name} •</span>}
              <span>-{percentOff}% OFF</span>
            </div>
            {timeLeft && (
              <div className="rounded-full bg-black/90 px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-sm flex items-center w-max font-mono tracking-wider">
                ⏱ {timeLeft}
              </div>
            )}
          </div>
        )}
      </div>

      <motion.div style={{ y: textY }} className="relative z-10 -mt-2 p-3 pb-4.5 sm:p-5 bg-card">
        <motion.div initial={false} whileHover={{ y: -3 }} transition={{ duration: 0.3, ease }}>
          <p className="mb-1 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-primary font-body">
            {perfume.brand}
          </p>
          <h3 className="mb-1.5 text-sm font-medium leading-snug text-foreground font-display sm:text-[1.25rem] truncate">
            {perfume.scent_name}
          </h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-display text-base leading-none text-foreground sm:text-2xl">
                {formatPhp(displayPrice)}
              </p>
              {hasFlashSale && (
                <p className="text-[10px] text-muted-foreground line-through mt-0.5">
                  {formatPhp(perfume.target_sale_price)}
                </p>
              )}
            </div>
            <motion.span initial={{ opacity: 0, x: -6 }} whileHover={{ opacity: 1, x: 0 }} className="hidden text-[10px] uppercase tracking-[0.15em] text-primary font-body sm:block">
              View →
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}