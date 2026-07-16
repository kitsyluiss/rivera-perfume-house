"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PerfumeCard from "@/components/PerfumeCard";
import { Perfume } from "@/lib/types";
import { PERFUME_TAGS, inferPerfumeTag } from "@/lib/perfume-tags";
import PreloaderIdent from "@/components/PreloaderIdent";

const ease = [0.22, 1, 0.36, 1] as const;

function BrandDropdown({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label = value === "all" ? "All Brands" : value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full min-w-[160px] items-center justify-between gap-3 rounded-full border border-primary/20 bg-card px-4 text-sm text-foreground transition hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="truncate">{label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease }}
            className="absolute left-1/2 top-[calc(100%+6px)] z-[200] w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-primary/15 bg-card shadow-xl shadow-black/20 backdrop-blur-md"
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {["all", ...brands].map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    onChange(brand);
                    setOpen(false);
                  }}
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
        )}
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
  const [brandFilter, setBrandFilter] = useState("all");
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
        className="bg-gradient-mesh relative min-h-screen overflow-x-hidden transition-opacity duration-500"
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
          className="font-display overflow-hidden text-3xl font-light leading-none tracking-[0.18em] text-primary sm:text-5xl md:text-6xl"
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
          {/* Search */}
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by brand or scent..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-full border-primary/20 bg-card pl-11 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md transition-all duration-300 focus-visible:border-primary/50 focus-visible:ring-primary/40 sm:h-13"
            />
          </div>

          {/* Brand + Category on the same row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            {/* Brand dropdown */}
            <BrandDropdown
              brands={brands}
              value={brandFilter}
              onChange={setBrandFilter}
            />

            {/* Divider */}
            <span className="hidden h-5 w-px bg-border sm:block" />

            {/* Category pills */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setTagFilter("all")}
                className={`rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] transition sm:px-3.5 sm:py-2 sm:text-[10px] ${
                  tagFilter === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
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
                    className={`rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] transition sm:px-3.5 sm:py-2 sm:text-[10px] ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag.value}
                  </button>
                );
              })}
            </div>
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
        <AnimatePresence mode="popLayout">
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
            <motion.div layout transition={{ duration: 0.4, ease }} className="w-full grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((perfume, index) => (
                <PerfumeCard key={perfume.id} perfume={perfume} index={index} />
              ))}
            </motion.div>
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
    </main>
    </>
  );
}