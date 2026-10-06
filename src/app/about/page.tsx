import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Truck, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import AboutWholesaleDossier from "@/components/AboutWholesaleDossier";

export const metadata: Metadata = {
  title: "About Us & Our Family Guarantee | Rivera Fragrance House",
  description:
    "Learn about Rivera Fragrance House, a small family-run fragrance shop based in Malabon, Metro Manila. We guarantee 100% genuine Middle Eastern & designer perfumes with verified batch codes and direct pricing.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Rivera Fragrance House — 100% Authentic Perfumes",
    description:
      "A trusted family perfumery based in Metro Manila offering genuine Middle Eastern & designer perfumes with verified batch codes.",
    url: "/about",
  },
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-clip px-4 py-28 sm:py-36">
      {/* Ambient Animated Mesh Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-gradient-mesh absolute inset-0" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center space-x-2 text-xs font-mono text-white/50">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li className="text-primary font-medium" aria-current="page">About Us</li>
          </ol>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
            About Our Family
          </span>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-wide leading-tight mb-6">
            Authentic Perfumes. <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6e3a1] to-primary">
              Honest Family Values.
            </span>
          </h1>

          <p className="font-body text-base sm:text-lg text-white/75 leading-relaxed">
            Rivera Fragrance House was founded on a simple family promise: to give fragrance collectors and resellers in the Philippines access to original, factory-sealed Middle Eastern and international perfumes at honest local prices with zero counterfeit risk.
          </p>

        </div>

        {/* 3 Core Value Columns — Clean, open, minimal borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16 text-left">
          <div className="border-t border-white/10 pt-6 space-y-3">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Original Sealed</span>
            </div>
            <h2 className="font-display text-2xl text-white font-light">Verified Batch Codes</h2>
            <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
              Every bottle arrives in authentic factory packaging with matching batch codes stamped on both the outer carton and the bottle base.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-3">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
              <Users className="h-4 w-4" />
              <span>Personal &amp; Resellers</span>
            </div>
            <h2 className="font-display text-2xl text-white font-light">Fair Local Pricing</h2>
            <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
              Whether you need a single bottle for daily wear or multiple bottles to start your own fragrance resale business, we offer honest direct rates.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-3">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
              <Truck className="h-4 w-4" />
              <span>Malabon Fulfillment</span>
            </div>
            <h2 className="font-display text-2xl text-white font-light">Careful Packaging</h2>
            <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
              Dispatched with heavy-duty multi-layer bubble wrap protection across Metro Manila and provincial couriers nationwide.
            </p>
          </div>
        </div>

        {/* Story Section — Open Editorial Layout (No heavy container box) */}
        <div className="my-20 border-t border-white/10 pt-16 text-left">
          <div className="max-w-3xl">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
              Our Sourcing Standard
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white font-light leading-snug mb-6">
              Genuine Fragrances. Verified Sourcing.
            </h2>
            <div className="space-y-5 text-sm sm:text-base text-white/75 font-body leading-relaxed">
              <p>
                We carefully source our Middle Eastern and designer perfumes through trusted, legitimate distributors. We personally inspect each bottle for authentic packaging, crisp cellophane wrapping, and matching manufacturer batch codes before it ever reaches our inventory.
              </p>
              <p>
                As a growing family business in Malabon, our focus is quality over volume. We keep our prices fair and honest by running a lean, community-driven shop without the inflated markups of commercial malls.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Verifiable batch codes on outer box &amp; bottle</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Protected storage to maintain fragrance oil freshness</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Same-day Metro Manila courier or provincial shipping</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Direct, friendly customer care from our family</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Wholesale & Reseller Partnership Protocol */}
        <AboutWholesaleDossier />

        {/* Navigation CTAs */}
        <div className="mt-16 text-center border-t border-white/10 pt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-white transition-all shadow-xl shadow-black/50"
          >
            <span>Explore Live Catalog (₱)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-all"
          >
            <span>Browse Collections</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
