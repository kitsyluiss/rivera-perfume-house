import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Truck, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & Our Family Guarantee | Rivera Fragrance House",
  description:
    "Learn about Rivera Fragrance House, a family-run fragrance importer in Malabon, Metro Manila. We guarantee 100% genuine Middle Eastern & designer perfumes with verified batch codes and direct pricing.",
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
    <main className="min-h-screen bg-black text-white px-4 py-32 sm:py-40">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-mono text-white/50">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li className="text-primary" aria-current="page">About Us</li>
          </ol>
        </nav>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-black/60 px-4 py-1.5 text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Malabon, Metro Manila &bull; Family Owned
        </div>

        {/* H1 Heading */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light tracking-wide leading-tight mb-8">
          Authentic Perfumes. <br />
          <span className="italic text-primary">Honest Family Values.</span>
        </h1>

        <p className="font-body text-base sm:text-lg text-white/80 leading-relaxed mb-12">
          Rivera Fragrance House was built on a simple family promise: to give fragrance enthusiasts and resellers in the Philippines direct access to original, factory-sealed Middle Eastern and designer perfumes without inflated retail markups or the worry of counterfeit bottles.
        </p>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
            <ShieldCheck className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-xl text-white font-light mb-2">100% Original Sealed</h2>
            <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
              Every bottle arrives in its original manufacturer cellophane with verifiable batch codes. We maintain a zero-counterfeit policy.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-xl text-white font-light mb-2">Retail &amp; Wholesale</h2>
            <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
              Whether you need one signature bottle for daily wear or cartons for your resale business, we offer fair supplier rates in Philippine Pesos (₱).
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
            <Truck className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-xl text-white font-light mb-2">Nationwide Delivery</h2>
            <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
              Dispatched safely from Malabon with heavy-duty shock-absorbing packaging across Metro Manila, Luzon, Visayas, and Mindanao.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="space-y-6 text-sm sm:text-base text-white/75 font-body leading-relaxed border-t border-white/10 pt-12">
          <h2 className="font-display text-2xl sm:text-3xl text-white font-light mb-4">
            Direct from Dubai &amp; Trusted Global Distributors
          </h2>
          <p>
            By establishing direct relationships with authorized distributors in the United Arab Emirates, we bypass multiple layers of middlemen. This allows us to bring sought-after beast-mode fragrances like Rasasi Hawas, Armaf Club de Nuit, French Avenue Liquid Brun, and Rayhaan directly to the Philippine market at competitive prices.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Verifiable batch codes on every box &amp; bottle</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Climate-controlled storage to preserve fragrance oils</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Same-day or next-day Metro Manila dispatch</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Personalized customer care from our family to yours</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-white transition-all shadow-lg shadow-black/50"
          >
            <span>Explore Current Fragrances (₱)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
