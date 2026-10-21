import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Truck, ArrowRight, CheckCircle2, Sparkles, BadgeCheck } from "lucide-react";
import AboutWholesaleDossier from "@/components/AboutWholesaleDossier";

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.455 5.518 3.735 7.172V22l3.418-1.875c.915.253 1.884.39 2.847.39 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2zm1.002 12.445l-2.56-2.73-4.996 2.73 5.496-5.834 2.62 2.73 4.936-2.73-5.496 5.834z"/>
    </svg>
  );
}

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

        {/* Official Channels Section — Luxury, Positive & Confident */}
        <section className="my-20 border border-white/10 bg-gradient-to-b from-white/[0.04] via-black/40 to-black/80 rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] mb-4">
                <BadgeCheck className="h-3.5 w-3.5" />
                <span>Direct Connection</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-white font-light tracking-wide leading-tight mb-3">
                Connect With Our House
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                Follow our official social channels for live fragrance arrivals, decant menus, bottle lookbooks, and direct customer care from our family.
              </p>
            </div>

            {/* Official Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://www.instagram.com/riverafragrancehouse._07/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg">
                    <InstagramIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">Official Instagram</span>
                    <span className="font-display text-sm text-white group-hover:text-primary transition-colors">@riverafragrancehouse._07</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>

              <a
                href="https://www.facebook.com/riverafraghouse"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-lg">
                    <FacebookIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">Official Facebook</span>
                    <span className="font-display text-sm text-white group-hover:text-primary transition-colors">@riverafraghouse</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>
            </div>
          </div>
        </section>

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
