"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Search, Filter } from "lucide-react";
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

const ease = [0.22, 1, 0.36, 1] as const;

export default function CatalogView({
  initialPerfumes,
}: {
  initialPerfumes: Perfume[];
}) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [brandFilter, setBrandFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

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
        className="relative min-h-screen transition-opacity duration-1000"
        style={{ opacity: preloaderDone ? 1 : 0 }}
      >
        {/* Editorial Hero */}
        <header className="px-6 pt-32 pb-16 lg:px-12 lg:pt-48 lg:pb-32">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            
            {/* Massive Structural Typography */}
            <div className="flex-1">
              <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] leading-[0.85] font-light text-foreground tracking-tight">
                Curated
                <br />
                <span className="text-muted-foreground">Scents</span>
              </h1>
              <p className="mt-8 max-w-sm text-sm font-light text-muted-foreground leading-relaxed font-body">
                An exclusive collection of fine fragrances, sourced globally and presented for the discerning collector.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col gap-8 w-full max-w-md">
              <div className="relative border-b border-border pb-2">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search collection..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent pl-8 outline-none text-sm font-light placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground w-16">Brand</span>
                  <select 
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="bg-transparent text-sm outline-none cursor-pointer flex-1"
                  >
                    <option value="all">All Houses</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-4 border-t border-border pt-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground w-16">Season</span>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setTagFilter("all")}
                      className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${tagFilter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      All
                    </button>
                    {PERFUME_TAGS.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => setTagFilter(tag.value.toLowerCase())}
                        className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${tagFilter === tag.value.toLowerCase() ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {tag.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Grid Section */}
        <section className="mx-auto max-w-7xl px-6 pb-32 lg:px-12">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-20 text-center text-sm font-light text-muted-foreground"
              >
                No fragrances match your criteria.
              </motion.p>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
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

        {/* Minimal Footer */}
        <footer className="border-t border-border py-12 text-center">
          <p className="font-body text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            Rivera Fragrance House
          </p>
        </footer>

        {/* Detail Modal — Stark slide-in panel */}
        <AnimatePresence>
          {selectedPerfume && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="fixed inset-0 z-[5000] flex justify-end"
            >
              {/* Dark overlay */}
              <div
                className="absolute inset-0 bg-background/90 backdrop-blur-sm cursor-pointer"
                onClick={() => setSelectedPerfume(null)}
              />

              {/* Slide-in content panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full md:w-[600px] h-full bg-card border-l border-border shadow-2xl flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPerfume(null)}
                  className="absolute right-6 top-6 z-50 text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  <X className="h-6 w-6 stroke-[1]" />
                </button>

                <div className="overflow-y-auto flex-1">
                  {/* Image Header */}
                  <div className="relative aspect-square w-full bg-secondary">
                    {selectedPerfume.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedPerfume.image_url}
                        alt={selectedPerfume.scent_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/30">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-10 md:p-16">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                      {selectedPerfume.brand}
                    </p>
                    <h2 className="font-display text-4xl lg:text-5xl font-light mb-8">
                      {selectedPerfume.scent_name}
                    </h2>
                    
                    <p className="font-body text-sm font-light leading-relaxed text-muted-foreground mb-12">
                      {getFragranceDNA(selectedPerfume.scent_name).description}
                    </p>

                    <div className="flex items-end justify-between border-b border-border pb-8 mb-8">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Price</p>
                        <p className="font-body text-2xl font-light">
                          {formatPhp(selectedPerfume.target_sale_price)}
                        </p>
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                        {selectedPerfume.quantity > 0 ? "In Stock" : "Sold Out"}
                      </span>
                    </div>

                    {/* Minimal Editorial Accords */}
                    {(() => {
                      const dna = getFragranceDNA(selectedPerfume.scent_name);
                      return (
                        <div className="mb-12">
                          <h4 className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-3 mb-6">
                            Fragrance Notes
                          </h4>
                          
                          {/* Notes Pyramid (Minimalist) */}
                          <div className="flex flex-col gap-6 mb-10">
                            {dna.notes.top && dna.notes.top.length > 0 && (
                              <div className="flex gap-4 items-start">
                                <span className="w-16 text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-1">Top</span>
                                <div className="flex-1 font-body text-sm font-light text-foreground leading-relaxed">
                                  {dna.notes.top.join(" • ")}
                                </div>
                              </div>
                            )}
                            {dna.notes.heart && dna.notes.heart.length > 0 && (
                              <div className="flex gap-4 items-start">
                                <span className="w-16 text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-1">Heart</span>
                                <div className="flex-1 font-body text-sm font-light text-foreground leading-relaxed">
                                  {dna.notes.heart.join(" • ")}
                                </div>
                              </div>
                            )}
                            {dna.notes.base && dna.notes.base.length > 0 && (
                              <div className="flex gap-4 items-start">
                                <span className="w-16 text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-1">Base</span>
                                <div className="flex-1 font-body text-sm font-light text-foreground leading-relaxed">
                                  {dna.notes.base.join(" • ")}
                                </div>
                              </div>
                            )}
                          </div>

                          <h4 className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-3 mb-6">
                            Accords
                          </h4>

                          {/* Minimalist Line Accords */}
                          <div className="flex flex-col gap-3">
                            {dna.accords.map((accord) => (
                              <div key={accord.name} className="flex items-center gap-4">
                                <span className="w-24 text-[9px] uppercase tracking-[0.2em] text-muted-foreground truncate">
                                  {accord.name}
                                </span>
                                <div className="flex-1 h-px bg-border relative">
                                  <motion.div
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute left-0 top-0 bottom-0 origin-left bg-primary"
                                    style={{ width: `${accord.value}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <Button
                      onClick={async () => {
                        setIsAddingToCart(true);
                        try {
                          await addToCart(selectedPerfume.id, 1);
                          toast.success("Added to cart");
                        } finally {
                          setIsAddingToCart(false);
                        }
                      }}
                      disabled={isAddingToCart || selectedPerfume.quantity === 0}
                      className="w-full h-14 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors duration-500 text-[10px] uppercase tracking-[0.3em] rounded-none"
                    >
                      {selectedPerfume.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}