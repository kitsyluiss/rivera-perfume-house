import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Tag, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Fragrance Journal & Guides | Rivera Fragrance House",
  description:
    "Expert reviews, comparisons, clone guides, and tips for buying genuine Middle Eastern perfumes in the Philippines. Discover top beast-mode performers.",
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    title: "Rivera Fragrance Journal — Reviews & Fragrance Guides",
    description:
      "Expert insights on Middle Eastern perfumery, batch code verification, and tropical fragrance longevity.",
    url: "/journal",
  },
};

export default function JournalPage() {
  const articles = [
    {
      title: "Rasasi Hawas vs. Hawas Ice vs. Hawas Black: Which One Should You Buy?",
      date: "October 2026",
      tag: "Comparison Guide",
      readTime: "5 min read",
      excerpt:
        "An in-depth breakdown of the legendary Hawas trilogy. We analyze the original fresh aquatic DNA, the cooling mint citrus of Hawas Ice, and the darker, smoky pineapple complexity of Hawas Black in Philippine humidity.",
      link: "/catalog?scent=rasasi-hawas",
    },
    {
      title: "How to Verify Perfume Batch Codes and Avoid Fakes Online",
      date: "September 2026",
      tag: "Buyer Safety",
      readTime: "4 min read",
      excerpt:
        "A practical guide on how to read manufacturer batch codes, inspect cellophane folds, examine atomizer crimping, and verify authenticity before purchasing imported fragrances in the Philippines.",
      link: "/about",
    },
    {
      title: "Why Middle Eastern Perfumes Outlast High-End Designer Bottles",
      date: "September 2026",
      tag: "Fragrance Science",
      readTime: "6 min read",
      excerpt:
        "Middle Eastern houses like Lattafa, Armaf, and Afnan utilize higher perfume oil concentrations and rich resinous bases (ambergris, oud, cedar) designed to cut through high heat and sweat.",
      link: "/collections",
    },
    {
      title: "Top 5 Office-Safe Fragrances for Hot & Humid Commutes",
      date: "August 2026",
      tag: "Daily Wear",
      readTime: "4 min read",
      excerpt:
        "The best clean, inoffensive yet long-lasting scents for daily office work in Metro Manila. Featuring Fragrance World Varakh Silver, Khadlaj Shiyaaka Snow, and Armaf Hunter Men.",
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
            <li className="text-primary font-medium" aria-current="page">Journal</li>
          </ol>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
            Editorial &amp; Reviews
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6e3a1] to-primary">Journal</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed">
            Honest reviews, head-to-head comparisons, and practical buyer guides for fragrance collectors and resellers in the Philippines.
          </p>

        </div>

        {/* Articles List */}
        <div className="space-y-8 mb-16">
          {articles.map((art) => (
            <article
              key={art.title}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-primary/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/50 mb-4">
                  <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">
                    <Tag className="h-3 w-3" />
                    {art.tag}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {art.date}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Clock className="h-3.5 w-3.5" />
                    {art.readTime}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl text-white font-light leading-snug mb-3">
                  {art.title}
                </h2>
                <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed mb-6">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Link
                  href={art.link}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary hover:text-white transition-colors"
                >
                  <span>Explore Featured Scents (₱)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-white transition-all shadow-xl"
          >
            <span>View All Fragrances in Stock (₱)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
