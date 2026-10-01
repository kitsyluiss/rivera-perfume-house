"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChevronDown, Filter, Search, X, ShoppingCart, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PerfumeCard from "@/components/PerfumeCard";
import { Perfume } from "@/lib/types";
import { PERFUME_TAGS, inferPerfumeTag } from "@/lib/perfume-tags";
import PreloaderIdent from "@/components/PreloaderIdent";
import { formatPhp } from "@/lib/format";
import { getFragranceDNA } from "@/lib/fragrance-dna";
import { addToCart } from "@/lib/cart-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import HeroCarousel3D from "@/components/HeroCarousel3D";
import { getAvifUrl } from "@/lib/get-avif";

const ease = [0.22, 1, 0.36, 1] as const;

function getAccordGradient(color: string): string {
  switch (color) {
    case "fruity":
      return "linear-gradient(90deg, #da4453, #e9573f)";
    case "citrus":
      return "linear-gradient(90deg, #f6bb42, #fc6e51)";
    case "sweet":
      return "linear-gradient(90deg, #ec87c0, #d770ad)";
    case "fresh":
      return "linear-gradient(90deg, #3bafda, #4fc1e9)";
    case "aromatic":
      return "linear-gradient(90deg, #8cc152, #a0d468)";
    case "musky":
    case "musk":
      return "linear-gradient(90deg, #ccd1d9, #aab2bd)";
    case "powdery":
      return "linear-gradient(90deg, #d2d6de, #e6e9ed)";
    case "fresh_spicy":
      return "linear-gradient(90deg, #fc6e51, #f6bb42)";
    case "green":
      return "linear-gradient(90deg, #37bc9b, #48cfad)";
    case "white_floral":
      return "linear-gradient(90deg, #f5f7fa, #e4e7eb)";
    case "woody":
      return "linear-gradient(90deg, #8d6e63, #a1887f)";
    case "amber":
      return "linear-gradient(90deg, #ffb300, #ffca28)";
    case "cinnamon":
      return "linear-gradient(90deg, #b71c1c, #d32f2f)";
    case "warm_spicy":
      return "linear-gradient(90deg, #c0392b, #d35400)";
    case "vodka":
      return "linear-gradient(90deg, #cbd5e1, #94a3b8)";
    case "soft_spicy":
      return "linear-gradient(90deg, #e6c280, #f3d9ab)";
    case "floral":
      return "linear-gradient(90deg, #ec4899, #f472b6)";
    case "earthy":
      return "linear-gradient(90deg, #5d4037, #8d6e63)";
    case "vanilla":
      return "linear-gradient(90deg, #fef08a, #fde047)";
    case "lavender":
      return "linear-gradient(90deg, #a78bfa, #c084fc)";
    case "leather":
      return "linear-gradient(90deg, #4e342e, #5d4037)";
    case "smoky":
      return "linear-gradient(90deg, #374151, #4b5563)";
    case "animalic":
      return "linear-gradient(90deg, #a0522d, #8b4513)";
    default:
      return "linear-gradient(90deg, #d6b36d, #e8c547)";
  }
}

function BrandDropdown({
  brands,
  value,
  onChange,
  onClose,
  align = "center",
}: {
  brands: string[];
  value: string;
  onChange: (v: string) => void;
  onClose?: () => void;
  align?: "left" | "center" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const alignClass =
    align === "right"
      ? "right-0"
      : align === "left"
        ? "left-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div ref={ref} className="relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease }}
          className={`absolute ${alignClass} top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-xl border border-primary/15 bg-card shadow-xl shadow-black/20 backdrop-blur-md`}
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {["all", ...brands].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => onChange(brand)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                  value === brand
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary/60"
                }`}
              >
                {brand === "all" ? "All Brands" : brand}
                {value === brand && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function CatalogView({
  initialPerfumes,
  initialCarouselPerfumes,
}: {
  initialPerfumes: Perfume[];
  initialCarouselPerfumes?: Perfume[];
}) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [selectionSource, setSelectionSource] = useState<"grid" | "carousel" | null>(null);

  const shuffleAll = (items: Perfume[]) => {
    const pool = items.filter(
      (p) => p.quantity > 0 && (getAvifUrl(p) !== "/logo.svg" || p.image_url)
    );
    const candidate = pool.length >= 4 ? pool : items;
    const shuffled = [...candidate];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [carouselPerfumes, setCarouselPerfumes] = useState<Perfume[]>(() => {
    if (initialCarouselPerfumes && initialCarouselPerfumes.length > 0) {
      return initialCarouselPerfumes;
    }
    return shuffleAll(initialPerfumes).slice(0, 8);
  });

  useEffect(() => {
    // Only randomize on the client if we didn't receive a subset from the server
    if (!initialCarouselPerfumes || initialCarouselPerfumes.length === 0) {
      setCarouselPerfumes(shuffleAll(initialPerfumes).slice(0, 8));
    }
  }, [initialPerfumes, initialCarouselPerfumes]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();
  const [brandFilter, setBrandFilter] = useState("all");
  const [brandOpen, setBrandOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState("all");

  const { scrollYProgress } = useScroll();
  const barWidth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const brands = useMemo(
    () =>
      [...new Set(initialPerfumes.map((perfume) => perfume.brand))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [initialPerfumes]
  );

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return initialPerfumes.filter((perfume) => {
      const tag = inferPerfumeTag(perfume);
      const matchesSearch =
        !normalized ||
        perfume.brand.toLowerCase().includes(normalized) ||
        perfume.scent_name.toLowerCase().includes(normalized);
      const matchesBrand =
        brandFilter === "all" || perfume.brand === brandFilter;
      const matchesTag =
        tagFilter === "all" || tag.toLowerCase() === tagFilter;

      return matchesSearch && matchesBrand && matchesTag;
    });
  }, [brandFilter, initialPerfumes, query, tagFilter]);

// Dismiss modal on Escape key press
  useEffect(() => {
    if (!selectedPerfume) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPerfume(null);
        setSelectionSource(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPerfume]);

  // Lock body scroll, pause Lenis, and toggle modal-open class when modal is open
  useEffect(() => {
    const lenis = typeof window !== "undefined" ? (window as any).__lenis : null;
    if (selectedPerfume) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
      lenis?.start();
    };
  }, [selectedPerfume]);

  return (
    <>
      {!preloaderDone && (
        <PreloaderIdent onComplete={() => setPreloaderDone(true)} />
      )}

      <main
        className="bg-black relative min-h-screen overflow-x-clip transition-opacity duration-500"
        style={{ opacity: preloaderDone ? 1 : 0 }}
      >
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left"
        style={{
          scaleX: barWidth,
          background:
            "linear-gradient(90deg, hsl(38 44% 61% / 0.4), hsl(38 44% 61%))",
        }}
      />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-gradient-mesh absolute inset-0" />
      </div>

      {/* 1. BRAND HEADER: Appears first with generous breathing room below the floating navbar */}
      <header className="relative px-4 pb-4 pt-28 text-center sm:px-6 sm:pb-6 sm:pt-36">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.05, ease }}
          className="mx-auto mb-6 h-px w-10 bg-primary sm:mb-8"
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="font-display overflow-hidden text-5xl font-light leading-none tracking-[0.18em] pl-[0.18em] text-primary sm:text-7xl md:text-8xl"
        >
          {"RIVERA".split("").map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1 + index * 0.04, ease }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-3 text-[9px] uppercase tracking-[0.28em] pl-[0.28em] text-muted-foreground sm:mt-4 sm:text-xs"
        >
          Curated luxury fragrances
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.35, ease }}
          className="mx-auto mt-6 h-px w-10 bg-primary sm:mt-8"
        />
      </header>

      {/* 2. 3D HERO CAROUSEL: Placed below the branding with clear separation */}
      <section className="relative w-full my-6 md:my-10">
        <HeroCarousel3D 
          key={carouselPerfumes.map(p => p.id).join('-')}
          perfumes={carouselPerfumes}
          onSelect={(p) => {
            setSelectedPerfume(p);
            setSelectionSource("carousel");
          }}
          selectedPerfume={selectedPerfume}
          selectionSource={selectionSource}
        />
      </section>

      {/* 3. FILTER & SEARCH SECTION */}
      <section className="relative px-4 pb-6 pt-2 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 sm:mt-10 sm:gap-5"
        >
          {/* Search + brand filter */}
          <div data-search-filter className="relative z-20 flex w-full max-w-xl items-center">
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by brand or scent..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-none border-0 border-b border-border bg-transparent pl-7 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 focus-visible:border-b-primary focus-visible:ring-0 sm:h-13"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setBrandOpen((o) => !o)}
                className={`flex h-8 w-8 items-center justify-center text-muted-foreground transition hover:text-foreground ${
                  brandFilter !== "all" ? "text-primary" : ""
                }`}
                aria-label="Filter by brand"
              >
                <Filter className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {brandOpen && (
                  <BrandDropdown
                    brands={brands}
                    value={brandFilter}
                    onChange={(v) => {
                      setBrandFilter(v);
                      setBrandOpen(false);
                    }}
                    onClose={() => setBrandOpen(false)}
                    align="right"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Category pills — single wrapping row */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setTagFilter("all")}
              className={`inline-flex items-center justify-center min-h-[44px] px-3.5 text-[10px] sm:text-xs uppercase tracking-[0.18em] transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
                tagFilter === "all"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {PERFUME_TAGS.map((tag) => {
              const active = tagFilter === tag.value.toLowerCase();
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setTagFilter(tag.value.toLowerCase())}
                  className={`inline-flex items-center justify-center min-h-[44px] px-3.5 text-[10px] sm:text-xs uppercase tracking-[0.18em] transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag.value}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-6 text-[9px] uppercase tracking-[0.24em] text-muted-foreground sm:text-[10px]"
        >
          {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-20 text-center text-base text-muted-foreground"
            >
              {initialPerfumes.length === 0
                ? "No perfumes in the collection yet."
                : "No fragrances match your search."}
            </motion.p>
          ) : (
            // NOTE: No `layout` on this wrapper — Framer Motion layout transforms
            // on the grid container can corrupt getBoundingClientRect() for the
            // last card on mobile, making it unclickable. Cards carry layout
            // themselves via their own `layout` prop.
            <div className="w-full grid grid-cols-2 gap-3 landscape:grid-cols-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((perfume, index) => (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  index={index}
                  isSelected={selectedPerfume?.id === perfume.id}
                  onClick={() => {
                    setSelectedPerfume(perfume);
                    setSelectionSource("grid");
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-t border-border py-10 text-center"
      >
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Rivera Fragrance House &mdash; Fine Fragrances
        </p>
      </motion.footer>

      <AnimatePresence>
        {selectedPerfume && (
          <>
            {/* Studio-Grade Seamless Radial Gradient Backdrop (z-[9990]) */}
            {/* Covers all page elements and navbar so no component leaks out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[9990] pointer-events-auto backdrop-blur-3xl"
              style={{
                background: "radial-gradient(circle at calc(50% - 20vw) 50%, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.96) 55%, rgba(0,0,0,1) 100%)",
              }}
              onClick={() => {
                setSelectedPerfume(null);
                setSelectionSource(null);
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            />

            {/* Foreground Modal Container (z-[9995]) */}
            <div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-perfume-title"
              className="fixed inset-0 z-[9995] pointer-events-none"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            >
              
              {/* Close Button (z-[10000]) */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                type="button"
                onClick={() => {
                  setSelectedPerfume(null);
                  setSelectionSource(null);
                }}
                aria-label="Close product details"
                className="absolute right-6 top-6 md:right-10 md:top-8 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white transition cursor-pointer pointer-events-auto shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* 1. Modal Bottle Display (Centered for both Grid & Carousel) */}
              <div className="absolute left-0 top-0 w-full h-1/2 md:w-[60vw] md:h-full flex items-center justify-center p-6 md:p-12 pointer-events-none">
                {(selectedPerfume.image_url || getAvifUrl(selectedPerfume) !== "/logo.svg") && (
                  <div className="relative h-[85%] md:h-full aspect-[9/16] flex items-center justify-center">
                    <motion.img
                      layoutId={selectionSource === "grid" ? `bottle-${selectedPerfume.id}` : undefined}
                      src={getAvifUrl(selectedPerfume)}
                      alt={selectedPerfume.scent_name}
                      className="relative z-10 h-[90%] w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
                      style={{ willChange: "transform" }}
                      initial={selectionSource === "carousel" ? { opacity: 0, scale: 0.88 } : undefined}
                      animate={selectionSource === "carousel" ? { opacity: 1, scale: 1 } : undefined}
                      exit={selectionSource === "carousel" ? { opacity: 0, scale: 0.88 } : undefined}
                      transition={{ type: "spring", stiffness: 75, damping: 18, mass: 1.1 }}
                    />
                  </div>
                )}
              </div>

              {/* 2. Seamless Floating Details Pane */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 25, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-1/2 md:top-0 w-full md:w-[45vw] lg:w-[40vw] h-1/2 md:h-full overflow-y-auto overscroll-contain p-6 md:p-16 z-20 pointer-events-auto flex flex-col"
                data-lenis-prevent="true"
              >
                <div className="my-auto py-8">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[#e1b854] text-[10px] uppercase tracking-[0.25em] mb-2 font-mono"
                  >
                    {selectedPerfume.brand}
                  </motion.p>
                  <motion.h2
                    id="modal-perfume-title"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-4xl lg:text-5xl text-white font-light leading-tight mb-4"
                  >
                    {selectedPerfume.scent_name}
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap gap-2 mb-6"
                  >
                    <span className="rounded-full border border-primary/25 px-3.5 py-1 text-[9px] uppercase tracking-[0.15em] text-primary">
                      {inferPerfumeTag(selectedPerfume)}
                    </span>
                    <span className="rounded-full border border-border px-3.5 py-1 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                      {selectedPerfume.quantity > 0 ? "Available" : "Unavailable"}
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
                    className="text-white/60 font-body text-sm leading-relaxed italic mb-8 border-l border-[#e1b854]/30 pl-4"
                  >
                    &ldquo;{getFragranceDNA(selectedPerfume.scent_name).description}&rdquo;
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.40, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
                  >
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Price
                    </p>
                    {(() => {
                      const hasFlashSale = selectedPerfume.flash_sale_price != null && 
                        selectedPerfume.flash_sale_end != null && 
                        new Date(selectedPerfume.flash_sale_end) > new Date() &&
                        (selectedPerfume.flash_sale_stock == null || selectedPerfume.flash_sale_stock > 0);
                      
                      if (hasFlashSale) {
                        return (
                          <div className="flex items-center gap-4">
                            <p className="font-display text-4xl font-semibold text-white">
                              {formatPhp(selectedPerfume.flash_sale_price!)}
                            </p>
                            <p className="font-display text-2xl text-muted-foreground line-through decoration-muted-foreground/40">
                              {formatPhp(selectedPerfume.target_sale_price)}
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                        <p className="font-display text-4xl font-semibold text-white">
                          {formatPhp(selectedPerfume.target_sale_price)}
                        </p>
                      );
                    })()}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8"
                  >
                    <motion.div
                      animate={actionError ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Button
                        onClick={async () => {
                          if (!selectedPerfume) return;
                          setIsAddingToCart(true);
                          setActionError(null);
                          try {
                            const result = await addToCart(selectedPerfume.id, 1);
                            if (result?.error) {
                              setActionError(result.error);
                            } else {
                              toast.success("Added to cart!");
                            }
                          } catch (e: any) {
                            setActionError(e.message || "Failed to add to cart");
                          } finally {
                            setIsAddingToCart(false);
                          }
                        }}
                        disabled={isAddingToCart || selectedPerfume.quantity === 0}
                        className="w-full md:w-auto px-12 h-14 text-xs uppercase tracking-widest bg-[#e1b854] text-black hover:bg-white hover:text-black transition-colors duration-300 rounded-none font-semibold"
                      >
                        {isAddingToCart ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : selectedPerfume.quantity === 0 ? (
                          "Out of Stock"
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Acquire
                          </>
                        )}
                      </Button>
                    </motion.div>
                    {actionError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-xs text-destructive font-medium"
                      >
                        {actionError}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Fragrance DNA block */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-12 pt-10 border-t border-white/10"
                  >
                    {(() => {
                      const dna = getFragranceDNA(selectedPerfume.scent_name);
                      return (
                        <div className="flex flex-col gap-10">
                          {/* Accords Profile */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#e1b854] mb-6 font-mono">
                              Accord Profile
                            </h4>
                            <div className="flex flex-col gap-4">
                              {dna.accords.map((accord) => (
                                <div key={accord.name} className="flex items-center gap-4">
                                  <span className="w-24 text-left text-xs text-white/60 font-medium">
                                    {accord.name}
                                  </span>
                                  <div className="h-1 bg-white/5 rounded-full flex-1 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${accord.value}%` }}
                                      transition={{ duration: 1.2, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                                      className="h-full rounded-full"
                                      style={{ background: getAccordGradient(accord.color) }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Fragrance Pyramid */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#e1b854] mb-6 font-mono">
                              Fragrance Pyramid
                            </h4>
                            <div className="flex flex-col gap-4">
                              {dna.notes.top && dna.notes.top.length > 0 && (
                                <div className="flex gap-4 items-start">
                                  <span className="w-16 text-[10px] text-white/40 font-mono uppercase tracking-[0.1em] pt-1">
                                    Top
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {dna.notes.top.map((note) => (
                                      <span key={note} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                                        {note}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {dna.notes.heart && dna.notes.heart.length > 0 && (
                                <div className="flex gap-4 items-start border-t border-white/5 pt-4">
                                  <span className="w-16 text-[10px] text-[#e1b854] font-mono uppercase tracking-[0.1em] pt-1">
                                    Heart
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {dna.notes.heart.map((note) => (
                                      <span key={note} className="rounded-full border border-[#e1b854]/20 bg-[#e1b854]/5 px-3 py-1 text-xs text-white">
                                        {note}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {dna.notes.base && dna.notes.base.length > 0 && (
                                <div className="flex gap-4 items-start border-t border-white/5 pt-4">
                                  <span className="w-16 text-[10px] text-white/40 font-mono uppercase tracking-[0.1em] pt-1">
                                    Base
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {dna.notes.base.map((note) => (
                                      <span key={note} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                                        {note}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
    </>
  );
}