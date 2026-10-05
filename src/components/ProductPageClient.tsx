"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Share2, 
  Check, 
  Droplets, 
  Clock, 
  Sparkles,
  Minus,
  Plus,
  Loader2,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { formatPhp } from "@/lib/format";
import { inferPerfumeTag } from "@/lib/perfume-tags";
import { getFragranceDNA, getAccordGradient } from "@/lib/fragrance-dna";
import { addToCart } from "@/lib/cart-actions";
import { getCatalogPhoto, getAvifUrl } from "@/lib/get-avif";
import { getPerfumeSlug } from "@/lib/slug";
import { toast } from "sonner";
import type { Perfume } from "@/lib/types";
import WholesaleModal from "@/components/WholesaleModal";

export default function ProductPageClient({
  perfume,
  imageUrl,
  totalStock,
  relatedPerfumes = [],
}: {
  perfume: Perfume;
  imageUrl: string;
  totalStock: number;
  relatedPerfumes?: Perfume[];
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wholesaleOpen, setWholesaleOpen] = useState(false);

  const tag = inferPerfumeTag(perfume);
  const dna = getFragranceDNA(perfume.scent_name);

  const hasFlashSale =
    perfume.flash_sale_price != null &&
    perfume.flash_sale_end != null &&
    new Date(perfume.flash_sale_end) > new Date() &&
    (perfume.flash_sale_stock == null || perfume.flash_sale_stock > 0);

  const displayPrice = hasFlashSale ? perfume.flash_sale_price! : perfume.target_sale_price;
  const inStock = totalStock > 0;

  const handleAddToCart = async () => {
    if (!inStock) return;
    setIsAdding(true);
    try {
      const res = await addToCart(perfume.id, quantity);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Added ${quantity}x ${perfume.brand} ${perfume.scent_name} to cart!`);
      }
    } catch (err) {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Fragrance link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-clip px-4 py-28 sm:py-36">
      {/* Ambient Animated Mesh Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-gradient-mesh absolute inset-0" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation — Clean & Minimal */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs font-mono text-white/50">
            <li>
              <Link href="/" className="hover:text-[#e1b854] transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/catalog" className="hover:text-[#e1b854] transition-colors">Catalog</Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/catalog?brand=${encodeURIComponent(perfume.brand)}`} className="hover:text-[#e1b854] transition-colors">
                {perfume.brand}
              </Link>
            </li>
            <li>/</li>
            <li className="text-[#e1b854] font-medium truncate max-w-[200px]" aria-current="page">
              {perfume.scent_name}
            </li>
          </ol>
        </nav>

        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-12 pb-6 border-b border-white/10">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-white/70 hover:text-[#e1b854] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Catalog (₱)</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWholesaleOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#e1b854]/40 bg-[#e1b854]/10 px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#e1b854] hover:bg-[#e1b854] hover:text-black transition-all cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Inquire Wholesale</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white hover:border-[#e1b854]/50 transition-all cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-[#e1b854]" />}
              <span>{copied ? "Copied!" : "Share Scent"}</span>
            </button>
          </div>
        </div>

        {/* Studio Product Showcase — Open, Breathing, Container-Free */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Atmospheric Floating Flacon (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Open Studio Pedestal (No heavy card box) */}
            <div className="relative w-full max-w-md aspect-[4/5] flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,184,84,0.14)_0%,transparent_68%)] pointer-events-none" />
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${perfume.brand} ${perfume.scent_name} Eau de Parfum Bottle`}
                className="relative z-10 max-h-[92%] max-w-[92%] object-contain drop-shadow-[0_28px_50px_rgba(0,0,0,0.9)] transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute bottom-2 left-2 z-20">
                <span className="rounded-full bg-black/80 border border-white/10 px-3 py-1 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#e1b854]">
                  {tag}
                </span>
              </div>
            </div>

            {/* Subtle verification points below image */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#e1b854]" /> 100% Sealed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#e1b854]" /> Verified Batch
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-[#e1b854]" /> Malabon Dispatch
              </span>
            </div>

            {/* Main Accords Profile — Positioned beneath the flacon showcase */}
            {dna.accords && dna.accords.length > 0 && (
              <div className="mt-10 sm:mt-12 w-full max-w-md pt-8 border-t border-white/10 text-left">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e1b854] block">
                    Main Accords Profile
                  </span>
                  <span className="text-[10px] font-mono text-white/40">
                    Scent Composition
                  </span>
                </div>

                <div className="space-y-3">
                  {dna.accords.map((accord) => (
                    <div key={accord.name} className="flex items-center gap-3.5">
                      <span className="w-24 shrink-0 text-left text-xs font-mono text-white/75 truncate">
                        {accord.name}
                      </span>
                      <div className="h-1.5 bg-white/5 rounded-full flex-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${accord.value}%`,
                            background: getAccordGradient(accord.color),
                          }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-[10px] font-mono text-white/40">
                        {accord.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Editorial Details & Purchasing (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#e1b854] mb-2 block">
              {perfume.brand} &bull; 100ml Eau de Parfum
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-wide leading-tight mb-4">
              {perfume.scent_name}
            </h1>

            {/* Price & Stock Strip */}
            <div className="flex flex-wrap items-baseline gap-4 mb-6 pb-6 border-b border-white/10">
              <span className="font-display text-3xl sm:text-4xl font-semibold text-[#e1b854]">
                {formatPhp(displayPrice)}
              </span>
              {hasFlashSale && (
                <span className="text-sm font-body text-white/40 line-through">
                  {formatPhp(perfume.target_sale_price)}
                </span>
              )}
              <span className="text-xs font-mono text-white/50">
                Direct Pricing &bull; Retail Single Bottle
              </span>
              <span className={`text-xs font-mono font-medium ml-auto ${inStock ? "text-emerald-400" : "text-rose-400"}`}>
                {inStock ? `● In Stock (${totalStock} available)` : "○ Sold Out"}
              </span>
            </div>

            {/* Fragrance Narrative */}
            <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed mb-8 border-l border-[#e1b854]/30 pl-4 italic">
              &ldquo;{dna.description}&rdquo;
            </p>

            {/* Purchase Controls — Minimal & High Contrast */}
            <div className="py-6 border-y border-white/10 mb-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center rounded-full border border-white/15 bg-black/60 px-3 py-1.5 gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || !inStock}
                  className="p-1 hover:text-[#e1b854] disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-mono text-sm w-6 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                  disabled={quantity >= totalStock || !inStock}
                  className="p-1 hover:text-[#e1b854] disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || !inStock}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#e1b854] px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-white transition-all shadow-xl disabled:opacity-40 cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Acquire ({formatPhp(displayPrice * quantity)})</span>
                  </>
                ) : (
                  <span>Currently Out of Stock</span>
                )}
              </button>
            </div>

            {/* Fragrance DNA & Notes Ledger — Open Editorial Rows */}
            <div className="space-y-6 mb-10">
              <h2 className="font-display text-2xl text-white font-light">Fragrance Notes &amp; Pyramid</h2>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 py-2 border-b border-white/5">
                  <span className="w-28 text-xs font-mono uppercase tracking-wider text-[#e1b854] shrink-0">
                    Top Notes
                  </span>
                  <span className="text-xs sm:text-sm text-white/75 font-body leading-relaxed">
                    {dna.notes?.top?.join(", ") || "Fresh citrus & aromatic spices"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 py-2 border-b border-white/5">
                  <span className="w-28 text-xs font-mono uppercase tracking-wider text-[#e1b854] shrink-0">
                    Heart Notes
                  </span>
                  <span className="text-xs sm:text-sm text-white/75 font-body leading-relaxed">
                    {dna.notes?.heart?.join(", ") || "Refined florals & exotic accords"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 py-2 border-b border-white/5">
                  <span className="w-28 text-xs font-mono uppercase tracking-wider text-[#e1b854] shrink-0">
                    Base Notes
                  </span>
                  <span className="text-xs sm:text-sm text-white/75 font-body leading-relaxed">
                    {dna.notes?.base?.join(", ") || "Smoky woods, ambergris & warm musk"}
                  </span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border-l border-white/10 pl-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Longevity Rating
                  </span>
                  <span className="text-sm font-semibold text-white">8+ Hours (Beast Mode)</span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Best Climate &bull; Occasion
                  </span>
                  <span className="text-sm font-semibold text-white">{perfume.season || tag || "Philippine Heat & Air-Conditioned Offices"}</span>
                </div>
              </div>
            </div>

            {/* Authentic Family Guarantee & Fulfillment Details */}
            <div className="pt-6 border-t border-white/10 space-y-3 text-xs text-white/65 font-body">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#e1b854] shrink-0 mt-0.5" />
                <span>
                  <strong>100% Genuine Sealed Stock:</strong> We personally inspect each box and guarantee verifiable manufacturer batch codes. Zero counterfeits.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#e1b854] shrink-0 mt-0.5" />
                <span>
                  <strong>Batch Photo Confirmation:</strong> Want to see the batch stamp before it ships? Message our team and we will gladly send photos of your carton.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-[#e1b854] shrink-0 mt-0.5" />
                <span>
                  <strong>Fast Local Dispatch:</strong> Dispatched from Malabon, Metro Manila. 1–2 days within Metro Manila via courier; 3–5 days nationwide via J&amp;T/LBC in multi-layer bubble wrap.
                </span>
              </div>
            </div>

            {/* Wholesale Banner with Clickable Modal Trigger */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-white/70 font-body leading-relaxed flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white mb-0.5">Wholesale &amp; Reseller Orders</p>
                <p>Ordering multiple bottles for your store? Connect directly on WhatsApp, Viber, or Messenger.</p>
              </div>
              <button
                type="button"
                onClick={() => setWholesaleOpen(true)}
                className="shrink-0 text-xs font-mono uppercase tracking-wider text-[#e1b854] hover:text-white transition-colors cursor-pointer"
              >
                Inquire &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Curated Recommendations ("More Fragrances to Explore") */}
        {relatedPerfumes && relatedPerfumes.length > 0 && (
          <section className="mt-28 pt-16 border-t border-white/10">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e1b854] block mb-1">
                  Curated Recommendations
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-light">
                  More Fragrances to <span className="italic text-[#e1b854]">Explore</span>
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-xs font-mono uppercase tracking-wider text-white/60 hover:text-[#e1b854] transition-colors inline-flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedPerfumes.map((p) => {
                const photo = getCatalogPhoto(p) || p.image_url || getAvifUrl(p);
                const slug = getPerfumeSlug(p);
                const price = p.flash_sale_price ?? p.target_sale_price;

                return (
                  <Link
                    key={p.id}
                    href={`/perfumes/${slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:border-[#e1b854]/40 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div className="relative aspect-[3/4] w-full flex items-center justify-center overflow-hidden mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`${p.brand} ${p.scent_name}`}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-[#e1b854] truncate mb-0.5">
                        {p.brand}
                      </p>
                      <h3 className="font-display text-sm sm:text-base text-white font-light truncate mb-2">
                        {p.scent_name}
                      </h3>
                      <p className="font-display text-sm font-semibold text-white">
                        {formatPhp(price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Global Wholesale Modal */}
      <WholesaleModal isOpen={wholesaleOpen} onClose={() => setWholesaleOpen(false)} />
    </main>
  );
}
