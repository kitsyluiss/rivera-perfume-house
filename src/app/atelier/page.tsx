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
      icon: Droplets,
      summary: "The difference between Eau de Toilette (5-15% oil), Eau de Parfum (15-20% oil), and Extrait de Parfum (20-40% oil) in tropical humidity.",
    },
    {
      title: "Fragrance Pyramids & DNA",
      icon: BookOpen,
      summary: "How top notes evaporate in the first 15 minutes, heart notes define the scent for 2-4 hours, and base notes anchor for 8+ hours.",
    },
    {
      title: "Maximizing Longevity in Philippine Weather",
      icon: Clock,
      summary: "Why heat accelerates evaporation, how moisturizing skin beforehand locks in perfume oils, and the best pulse points for all-day sillage.",
    },
    {
      title: "Projection & Sillage Etiquette",
      icon: Wind,
      summary: "Balancing beast-mode Middle Eastern fragrances between air-conditioned indoor office settings and outdoor tropical warmth.",
    },
  ];

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
            <li className="text-primary" aria-current="page">The Atelier</li>
          </ol>
        </nav>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
            Olfactory Education
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            The <span className="italic text-primary">Atelier</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed">
            Essential fragrance education, concentration breakdowns, and practical wear strategies tailored specifically for the tropical Philippine climate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-12">
          {guides.map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
              >
                <Icon className="h-6 w-6 text-primary mb-4" />
                <h2 className="font-display text-xl text-white font-light mb-2">{g.title}</h2>
                <p className="text-xs sm:text-sm text-white/65 font-body leading-relaxed">
                  {g.summary}
                </p>
              </div>
            );
          })}
        </div>

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
