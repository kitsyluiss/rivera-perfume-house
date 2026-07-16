"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import PerfumeCard from "@/components/PerfumeCard";
import { Perfume } from "@/lib/types";
import { PERFUME_TAGS, inferPerfumeTag } from "@/lib/perfume-tags";
import PreloaderIdent from "@/components/PreloaderIdent";
import { formatPhp } from "@/lib/format";
import { getFragranceDNA } from "@/lib/fragrance-dna";

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
          className={`absolute ${alignClass} top-[calc(100%+8px)] z-[1000] w-56 overflow-hidden rounded-xl border border-primary/15 bg-card shadow-xl shadow-black/20 backdrop-blur-md`}
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
}: {
  initialPerfumes: Perfume[];
}) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
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

  return (
    <>
      {!preloaderDone && (
        <PreloaderIdent onComplete={() => setPreloaderDone(true)} />
      )}

      <main
        className="bg-gradient-mesh relative min-h-screen overflow-x-clip transition-opacity duration-500"
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

      <header className="relative px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-10 sm:pt-16">
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
          className="font-display overflow-hidden text-5xl font-light leading-none tracking-[0.18em] text-primary sm:text-7xl md:text-8xl"
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
          className="mt-3 text-[9px] uppercase tracking-[0.28em] text-muted-foreground sm:mt-4 sm:text-xs"
        >
          Curated luxury fragrances
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.35, ease }}
          className="mx-auto mt-6 h-px w-10 bg-primary sm:mt-8"
        />

        {/* Filter section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 sm:mt-10 sm:gap-5"
        >
          {/* Search + brand filter */}
          <div className="relative z-[1000] flex w-full max-w-xl items-center">
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
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTagFilter("all")}
              className={`px-1 py-1.5 text-[9px] uppercase tracking-[0.18em] leading-none transition sm:py-2 sm:text-[10px] ${
                tagFilter === "all"
                  ? "text-primary"
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
                  className={`px-1 py-1.5 text-[9px] uppercase tracking-[0.18em] leading-none transition sm:py-2 sm:text-[10px] ${
                    active
                      ? "text-primary"
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
          className="mt-4 text-[9px] uppercase tracking-[0.24em] text-muted-foreground sm:mt-5 sm:text-[10px]"
        >
          {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
        </motion.p>
      </header>

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
                  onClick={() => setSelectedPerfume(perfume)}
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
          Rivera Perfume House &mdash; Fine Fragrances
        </p>
      </motion.footer>

      <AnimatePresence>
        {selectedPerfume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[5000] flex items-end justify-center md:items-center"
          >
            {/* Scrim */}
            <div
              className="absolute inset-0 bg-black/82 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedPerfume(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-t-[1.5rem] border border-border bg-background shadow-2xl md:rounded-[1.5rem] max-h-[92vh] md:max-h-[85vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedPerfume(null)}
                className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-card/85 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="overflow-y-auto overscroll-contain flex-1">
                {/* Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="relative aspect-[4/5] md:aspect-auto md:h-full md:col-span-5 bg-secondary overflow-hidden">
                    {selectedPerfume.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedPerfume.image_url}
                        alt={selectedPerfume.scent_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background" />
                  </div>

                  <div className="p-8 md:col-span-7 flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                      {selectedPerfume.brand}
                    </p>
                    <h2 className="font-display text-3xl font-light leading-tight text-foreground md:text-4xl lg:text-5xl mb-4">
                      {selectedPerfume.scent_name}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="rounded-full border border-primary/25 px-3.5 py-1 text-[9px] uppercase tracking-[0.15em] text-primary">
                        {inferPerfumeTag(selectedPerfume)}
                      </span>
                      <span className="rounded-full border border-border px-3.5 py-1 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                        {selectedPerfume.quantity > 0 ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <p className="text-xs font-light leading-relaxed text-muted-foreground/80 italic font-body mb-6">
                      &ldquo;{getFragranceDNA(selectedPerfume.scent_name).description}&rdquo;
                    </p>

                    <div className="mb-6">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Price
                      </p>
                      <p className="font-display text-3xl font-semibold text-foreground">
                        {formatPhp(selectedPerfume.target_sale_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          selectedPerfume.quantity > 0 ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {selectedPerfume.quantity > 0
                          ? selectedPerfume.quantity <= 5
                            ? `Low stock — only ${selectedPerfume.quantity} left`
                            : "In Stock"
                          : "Sold Out"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fragrance DNA block */}
                {(() => {
                  const dna = getFragranceDNA(selectedPerfume.scent_name);
                  return (
                    <div className="border-t border-border p-8">
                      {/* Accords Profile */}
                      <div className="mb-8">
                        <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6 font-mono">
                          Accord Profile
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {dna.accords.map((accord) => (
                            <div key={accord.name} className="flex items-center gap-3">
                              <span className="w-20 text-right text-xs text-muted-foreground">
                                {accord.name}
                              </span>
                              <div className="h-1 bg-border rounded-full flex-1 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${accord.value}%` }}
                                  transition={{ duration: 0.8, ease }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: getAccordGradient(accord.color),
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fragrance Pyramid */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6 font-mono">
                          Fragrance Pyramid
                        </h4>
                        <div className="flex flex-col gap-4 border-t border-primary/5 pt-2">
                          {dna.notes.top && dna.notes.top.length > 0 && (
                            <div className="flex gap-4 items-start">
                              <span className="w-16 text-xs text-[#7ed6c8] font-mono uppercase tracking-[0.1em] pt-1">
                                Top
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {dna.notes.top.map((note) => (
                                  <span key={note} className="rounded-full border border-[#7ed6c8]/15 px-3 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {dna.notes.heart && dna.notes.heart.length > 0 && (
                            <div className="flex gap-4 items-start border-t border-border/40 pt-4">
                              <span className="w-16 text-xs text-primary font-mono uppercase tracking-[0.1em] pt-1">
                                Heart
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {dna.notes.heart.map((note) => (
                                  <span key={note} className="rounded-full border border-primary/15 px-3 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {dna.notes.base && dna.notes.base.length > 0 && (
                            <div className="flex gap-4 items-start border-t border-border/40 pt-4">
                              <span className="w-16 text-xs text-[#c48a6e] font-mono uppercase tracking-[0.1em] pt-1">
                                Base
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {dna.notes.base.map((note) => (
                                  <span key={note} className="rounded-full border border-[#c48a6e]/15 px-3 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </>
  );
}