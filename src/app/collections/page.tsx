import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, Droplets, Moon, Briefcase } from "lucide-react";

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
      badge: "Best for Philippine Heat",
      icon: Droplets,
      description: "Crisp, breezy, energizing marine fragrances engineered to project strongly through tropical heat and humidity without cloying.",
      featured: ["Rasasi Hawas", "Hawas Ice", "Rayhaan Pacific Aloha", "Rayhaan Aquatica", "Shiyaaka Snow"],
      link: "/catalog?tag=Fresh",
    },
    {
      title: "Beast-Mode Compliment Champions",
      badge: "High Projection (8+ Hours)",
      icon: Flame,
      description: "Legendary clubbing and signature perfumes famous for intense sillage, smoky birch, dense blackcurrant, and magnetic fruit accords.",
      featured: ["Armaf Club de Nuit Intense Man", "Rasasi Hawas Black", "Afnan Supremacy Collector's Edition"],
      link: "/catalog",
    },
    {
      title: "Warm Gourmand & Evening Woods",
      badge: "Date Night & Air-Conditioned Spaces",
      icon: Moon,
      description: "Decadent bourbon vanilla, roasted praline, velvety cinnamon bark, rich leather, and sensual dark resins.",
      featured: ["French Avenue Liquid Brun", "Rayhaan Nocturno", "Fragrance World Varakh Silver", "Delilah Blanc"],
      link: "/catalog?tag=Warm",
    },
    {
      title: "Aristocratic Clean & Office Safe",
      badge: "Daily Signature Scents",
      icon: Briefcase,
      description: "Powdered musks, aromatic juniper berries, fresh nutmeg, and sheer woody ambers ideal for professional corporate wear.",
      featured: ["Fragrance World Varakh Silver", "Khadlaj Shiyaaka Snow", "Armaf Hunter Men", "French Avenue Vulcan Baie"],
      link: "/catalog?tag=Versatile",
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
            <li className="text-primary font-medium" aria-current="page">Collections</li>
          </ol>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
            Curated Scent Profiles
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            Fragrance <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6e3a1] to-primary">Collections</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed">
            Discover fragrances categorized by performance profile, Philippine climate suitability, and daily wear occasions.
          </p>

        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {collections.map((col) => {
            const Icon = col.icon;
            return (
              <div
                key={col.title}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
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
                          className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/75"
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
                    <span>View In Live Catalog (₱)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Catalog Banner */}
        <div className="mt-16 text-center rounded-3xl border border-white/10 bg-white/[0.02] p-10 backdrop-blur-2xl">
          <h2 className="font-display text-2xl sm:text-3xl text-white font-light mb-3">
            Looking for something specific?
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto mb-6 font-body">
            Browse our entire real-time inventory with live search, brand filters, and direct Philippine Peso pricing.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary transition-all shadow-xl"
          >
            <span>Browse Full Catalog (₱)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
