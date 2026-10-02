"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Perfume } from "@/lib/types";
import { formatPhp } from "@/lib/format";
import { inferPerfumeTag } from "@/lib/perfume-tags";
import { useCountdown } from "@/hooks/useCountdown";
import { getAvifUrl, getCatalogPhoto, getFallbackCatalogPhoto } from "@/lib/get-avif";

const ease = [0.22, 1, 0.36, 1] as const;

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

  // Robust photo resolution for the catalog grid:
  // 1. Primary catalog environment photo (JPG / uploaded Supabase photo)
  // 2. Fallback secondary catalog photo (PNG)
  // 3. Fallback AVIF cutout bottle if no catalog photo exists
  const catalogPhoto = getCatalogPhoto(perfume);
  const avifPhoto = getAvifUrl(perfume);
  const initialPhoto = catalogPhoto || (avifPhoto !== "/logo.svg" ? avifPhoto : null);

  const [imgSrc, setImgSrc] = useState<string | null>(initialPhoto);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    const nextPhoto = getCatalogPhoto(perfume) || (getAvifUrl(perfume) !== "/logo.svg" ? getAvifUrl(perfume) : null);
    setImgSrc(nextPhoto);
    setHasTriedFallback(false);
  }, [perfume.id, perfume.image_url, perfume.scent_name]);

  const handleImageError = () => {
    if (!hasTriedFallback) {
      setHasTriedFallback(true);
      const fallback = getFallbackCatalogPhoto(perfume);
      if (fallback && fallback !== imgSrc) {
        setImgSrc(fallback);
        return;
      }
      if (avifPhoto && avifPhoto !== "/logo.svg" && avifPhoto !== imgSrc) {
        setImgSrc(avifPhoto);
        return;
      }
    } else {
      if (avifPhoto && avifPhoto !== "/logo.svg" && avifPhoto !== imgSrc) {
        setImgSrc(avifPhoto);
        return;
      }
      setImgSrc(null);
    }
  };

  const isAvif = imgSrc?.toLowerCase().split("?")[0].endsWith(".avif");

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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "20px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.25), ease }}
      onClick={handleTap}
      className={`card-shimmer group relative cursor-pointer overflow-hidden rounded-[1.1rem] border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${
        clickedGlow ? "is-glowing" : ""
      } ${!inStock ? "opacity-50 grayscale" : ""}`}
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-secondary">
        {/* 1. Underlying Flacon with layoutId for the seamless spring morph into the modal */}
        <motion.img
          layoutId={`bottle-${perfume.id}`}
          src={getAvifUrl(perfume)}
          alt={`${perfume.brand} ${perfume.scent_name}`}
          className={`absolute inset-0 m-auto h-[85%] w-full object-contain pointer-events-none ${
            isSelected ? "z-20 opacity-100" : "z-0 opacity-0"
          }`}
          transition={{ type: "spring", stiffness: 85, damping: 18, mass: 1.0 }}
        />

        {/* 2. Full-bleed Catalog Environment Photo */}
        {imgSrc ? (
          <div 
            className={`absolute inset-0 h-full w-full overflow-hidden bg-secondary transition-opacity duration-300 ${
              isSelected ? "opacity-0 pointer-events-none" : "opacity-100 z-10"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imgSrc} 
              alt={`${perfume.brand} ${perfume.scent_name}`} 
              loading={index < 8 ? "eager" : "lazy"}
              decoding="async"
              onError={handleImageError}
              className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-105 ${
                isAvif ? "object-contain p-4 drop-shadow-lg" : "object-cover"
              }`} 
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/30">
            No image
          </div>
        )}

        {/* Subtle shadow gradient at bottom */}
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

      <div className="relative z-10 -mt-2 p-3 pb-4.5 sm:p-5 bg-card">
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
          <span className="hidden text-[10px] uppercase tracking-[0.15em] text-primary font-body sm:block group-hover:translate-x-1 transition-transform duration-300">
            View →
          </span>
        </div>
      </div>
    </motion.article>
  );
}
