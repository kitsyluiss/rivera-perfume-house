import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass, Flame, Droplets } from "lucide-react";

export const metadata: Metadata = {
  title: "Fragrance Collections & Scent Profiles | Rivera Fragrance House",
  description:
    "Browse curated collections of authentic Middle Eastern perfumes in the Philippines. Fresh tropical aquatics, beast-mode evening woods, and designer compliment champions.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Curated Fragrance Collections | Rivera Fragrance House",
    description:
      "Explore perfumes categorized by season, occasion, and scent profile for the Philippine climate.",
    url: "/collections",
  },
};

export default function CollectionsPage() {
  const collections = [
    {
      title: "Fresh Aquatics & Tropical Citrus",
      badge: "Best for Philippine Weather",
      icon: Droplets,
      description: "Crisp, breezy, refreshing marine scents engineered for high heat and humidity with exceptional projection.",
      featured: ["Rasasi Hawas", "Hawas Ice", "Rayhaan Pacific Aloha", "Rayhaan Aquatica"],
      link: "/catalog?tag=Fresh",
    },
    {
      title: "Beast-Mode Compliment Champions",
      badge: "High Projection (8+ Hours)",
      icon: Flame,
      description: "Iconic clubbing and signature perfumes famous for intoxicating sillage, dense fruit notes, and smoky woods.",
      featured: ["Armaf Club de Nuit Intense Man", "Rasasi Hawas Black", "Afnan Supremacy Not Only Intense"],
      link: "/catalog",
    },
    {
      title: "Warm Gourmand & Evening Woods",
      badge: "Date Night & Air-Conditioned Offices",
      icon: Sparkles,
      description: "Decadent bourbon vanilla, roasted praline, velvety spices, and rich leather accords.",
      featured: ["French Avenue Liquid Brun", "Rayhaan Nocturno", "Varakh Silver", "Maison Alhambra Delilah Blanc"],
      link: "/catalog?tag=Warm",
    },
    {
      title: "Aristocratic Clean & Office Safe",
      badge: "Daily Signature Scents",
      icon: Compass,
      description: "Powdered musks, aromatic juniper berries, fresh nutmeg, and sheer woody ambers suitable for everyday professional wear.",
      featured: ["Fragrance World Varakh Silver", "Khadlaj Shiyaaka Snow", "Armaf Hunter Men"],
      link: "/catalog?tag=Versatile",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-4 py-32 sm:py-40">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-mono text-white/50">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li className="text-primary" aria-current="page">Collections</li>
          </ol>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
            Curated Scent Profiles
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            Fragrance <span className="italic text-primary">Collections</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed">
            Discover fragrances grouped by performance profile, Philippine climate suitability, and daily wear occasions.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col) => {
            const Icon = col.icon;
            return (
              <div
                key={col.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
                      {col.badge}
                    </span>
                    <Icon className="h-5 w-5 text-primary/70" />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl text-white font-light mb-3">
                    {col.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-body text-white/70 leading-relaxed mb-6">
                    {col.description}
                  </p>

                  <div className="mb-8">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
                      Popular In This Profile:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {col.featured.map((scent) => (
                        <span
                          key={scent}
                          className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/70"
                        >
                          {scent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <Link
                    href={col.link}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary hover:text-white transition-colors"
                  >
                    <span>View In Catalog</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Catalog Link Banner */}
        <div className="mt-16 text-center rounded-2xl border border-white/10 bg-white/[0.02] p-10">
          <h2 className="font-display text-2xl sm:text-3xl text-white font-light mb-3">
            Looking for something specific?
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto mb-6 font-body">
            Browse our entire real-time inventory with live search, brand filters, and direct Philippine Peso pricing.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary transition-all shadow-xl"
          >
            <span>Browse Full Catalog (₱)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
