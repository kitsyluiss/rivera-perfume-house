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
  Flame,
  Minus,
  Plus,
  Loader2
} from "lucide-react";
import { formatPhp } from "@/lib/format";
import { inferPerfumeTag } from "@/lib/perfume-tags";
import { getFragranceDNA } from "@/lib/fragrance-dna";
import { addToCart } from "@/lib/cart-actions";
import { toast } from "sonner";
import type { Perfume } from "@/lib/types";

export default function ProductPageClient({
  perfume,
  imageUrl,
  totalStock,
}: {
  perfume: Perfume;
  imageUrl: string;
  totalStock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <main className="min-h-screen bg-black text-white px-4 py-28 sm:py-36">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-white/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Full Catalog (₱)</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white hover:border-primary/50 transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-primary" />}
            <span>{copied ? "Copied!" : "Share Scent"}</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Product Flacon Showcase (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,184,84,0.12)_0%,transparent_70%)] pointer-events-none" />
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${perfume.brand} ${perfume.scent_name} Eau de Parfum`}
                className="relative z-10 max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)] transition-transform duration-700 hover:scale-105"
              />

              {/* Tag Pill */}
              <div className="absolute bottom-4 left-4 z-20">
                <span className="rounded-full bg-card/90 border border-white/10 px-3 py-1 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-primary">
                  {tag}
                </span>
              </div>
            </div>

            {/* Quick Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-md text-center text-xs font-body text-white/60">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex flex-col items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase font-mono">100% Sealed</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex flex-col items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase font-mono">Batch Codes</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase font-mono">Fast Courier</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2">
              {perfume.brand} &bull; Sealed 100ml EDP
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-wide leading-tight mb-4">
              {perfume.scent_name}
            </h1>

            {/* Price & Stock */}
            <div className="flex flex-wrap items-baseline gap-4 mb-6 pb-6 border-b border-white/10">
              <span className="font-display text-3xl sm:text-4xl font-semibold text-primary">
                {formatPhp(displayPrice)}
              </span>
              {hasFlashSale && (
                <span className="text-sm font-body text-white/40 line-through">
                  {formatPhp(perfume.target_sale_price)}
                </span>
              )}
              <span className="text-xs font-mono text-white/50">
                Direct Supplier Rate &bull; Retail Single Bottle
              </span>
              <span className={`text-xs font-mono font-medium ml-auto ${inStock ? "text-emerald-400" : "text-rose-400"}`}>
                {inStock ? `● In Stock (${totalStock} available)` : "○ Sold Out"}
              </span>
            </div>

            {/* Description */}
            <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed mb-8">
              &ldquo;{dna.description}&rdquo;
            </p>

            {/* Purchase Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center rounded-full border border-white/15 bg-black/60 px-3 py-1.5 gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || !inStock}
                  className="p-1 hover:text-primary disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-mono text-sm w-6 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                  disabled={quantity >= totalStock || !inStock}
                  className="p-1 hover:text-primary disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || !inStock}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-white transition-all shadow-xl disabled:opacity-40 cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart ({formatPhp(displayPrice * quantity)})</span>
                  </>
                ) : (
                  <span>Currently Out of Stock</span>
                )}
              </button>
            </div>

            {/* Fragrance Notes / DNA */}
            <div className="space-y-6 border-t border-white/10 pt-8">
              <h2 className="font-display text-2xl text-white font-light">Fragrance DNA &amp; Sillage</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-mono uppercase tracking-wider mb-2">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>Top Notes</span>
                  </div>
                  <p className="text-xs text-white/70 font-body leading-relaxed">{dna.notes?.top?.join(", ") || "Fresh citrus & spices"}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-mono uppercase tracking-wider mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Heart Notes</span>
                  </div>
                  <p className="text-xs text-white/70 font-body leading-relaxed">{dna.notes?.heart?.join(", ") || "Aromatic florals & fruits"}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-mono uppercase tracking-wider mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Base Notes</span>
                  </div>
                  <p className="text-xs text-white/70 font-body leading-relaxed">{dna.notes?.base?.join(", ") || "Smoky woods, amber & musk"}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Longevity Rating
                  </span>
                  <span className="text-sm font-semibold text-white">8+ Hours (Beast Mode)</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Best Season / Occasion
                  </span>
                  <span className="text-sm font-semibold text-white">{perfume.season || tag || "Philippine Climate"}</span>
                </div>
              </div>
            </div>

            {/* Wholesale Banner */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-xs text-white/70 font-body leading-relaxed flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white mb-1">Wholesale &amp; Reseller Orders</p>
                <p>Ordering multiple bottles for your perfume business? Contact us for carton discounts.</p>
              </div>
              <Link
                href="/about"
                className="shrink-0 text-xs font-mono uppercase tracking-wider text-primary hover:text-white transition-colors"
              >
                Inquire &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
