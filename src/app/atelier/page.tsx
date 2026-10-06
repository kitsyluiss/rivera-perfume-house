import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Wind, Droplets } from "lucide-react";

export const metadata: Metadata = {
  title: "The Atelier & Olfactory Guide | Rivera Fragrance House",
  description:
    "Master the art of fragrance in the tropics. Notes, longevity ratings, scent concentration (EDT vs EDP vs Extrait), and application advice for Philippine heat.",
  alternates: {
    canonical: "/atelier",
  },
  openGraph: {
    title: "The Atelier — Fragrance Science & Tropical Application",
    description:
      "A comprehensive guide to perfume notes, projection, and longevity in warm tropical climates.",
    url: "/atelier",
  },
};

export default function AtelierPage() {
  const guides = [
    {
      title: "Understanding Fragrance Concentrations",
      badge: "Oil Concentration Breakdown",
      icon: Droplets,
      summary:
        "The difference between Eau de Toilette (5–15% oil), Eau de Parfum (15–20% oil), and Extrait de Parfum (20–40% oil). In tropical Philippine humidity, Extrait and dense EDP formulations resist sweat evaporation significantly longer.",
    },
    {
      title: "The Fragrance Pyramid & Molecular Evaporation",
      badge: "Top, Heart & Base Evolution",
      icon: BookOpen,
      summary:
        "Top notes (citrus, mint, apple) flash off in the first 15–30 minutes. Heart notes (florals, spices, aquatic accords) define the scent cloud for 2–4 hours. Base notes (ambergris, woods, vanilla, musk) anchor the drydown for 8+ hours.",
    },
    {
      title: "Maximizing Longevity in Philippine Weather",
      badge: "Tropical Heat Strategies",
      icon: Clock,
      summary:
        "High heat accelerates chemical evaporation. Applying an unscented moisturizer or petroleum jelly before spraying traps fragrance molecules against the skin, doubling sillage and longevity.",
    },
    {
      title: "Projection & Sillage Etiquette",
      badge: "Indoor vs. Outdoor Wear",
      icon: Wind,
      summary:
        "Beast-mode Middle Eastern fragrances project aggressively. For air-conditioned offices, 2–3 sprays suffice. For outdoor night events or humid commutes, 4–5 sprays guarantee a magnetic sillage trail.",
    },
  ];

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
            <li className="text-primary font-medium" aria-current="page">The Atelier</li>
          </ol>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
            Olfactory Science &amp; Education
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6e3a1] to-primary">Atelier</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed">
            Essential perfumery knowledge, molecular concentration analysis, and practical wear strategies tailored specifically for the tropical Philippine climate.
          </p>

        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {guides.map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.title}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
                      {g.badge}
                    </span>
                    <Icon className="h-5 w-5 text-primary/70" />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl text-white font-light mb-3">
                    {g.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-body text-white/70 leading-relaxed">
                    {g.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-white transition-all shadow-xl"
          >
            <span>Browse High-Longevity Perfumes (₱)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
