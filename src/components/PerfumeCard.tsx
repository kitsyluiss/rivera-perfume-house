"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Perfume } from "@/lib/types";
import { formatPhp } from "@/lib/format";
import { inferPerfumeTag } from "@/lib/perfume-tags";

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
  const inStock = perfume.quantity > 0;
  const tag = inferPerfumeTag(perfume);

  const hasFlashSale =
    perfume.flash_sale_price != null &&
    perfume.flash_sale_end != null &&
    new Date(perfume.flash_sale_end) > new Date() &&
    (perfume.flash_sale_stock == null || perfume.flash_sale_stock > 0);

  const displayPrice = hasFlashSale
    ? perfume.flash_sale_price!
    : perfume.target_sale_price;

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  
  // As the card moves from bottom of viewport to top, move it slightly on Y axis
  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.article
      ref={cardRef}
      style={{ y: yParallax }}
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.8,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.2, 0, 0.2, 1],
      }}
      onClick={onClick}
      className={`group cursor-pointer flex flex-col gap-4 ${
        !inStock ? "opacity-50 grayscale" : ""
      }`}
    >
      {/* Pure, borderless image block */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        {perfume.image_url ? (
          <img
            src={perfume.image_url}
            alt={perfume.scent_name}
            className="h-full w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.2,0,0.2,1)] group-hover:scale-105"
            loading={index < 4 ? "eager" : "lazy"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/30 font-body tracking-widest uppercase">
            No Image
          </div>
        )}

        {/* Minimal Tags */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hasFlashSale && (
            <span className="bg-foreground px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-background">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Stark Typography */}
      <div className="flex flex-col items-center text-center">
        <p className="mb-1 text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-body">
          {perfume.brand}
        </p>
        <h3 className="mb-2 text-lg lg:text-xl font-light tracking-wide text-foreground font-display">
          {perfume.scent_name}
        </h3>
        <p className="font-body text-sm font-light text-foreground">
          {formatPhp(displayPrice)}
        </p>
        <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
          {tag}
        </p>
      </div>
    </motion.article>
  );
}