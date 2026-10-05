import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

export const metadata = {
  title: "Page Not Found | Rivera Fragrance House",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-32">
      <div className="max-w-md w-full text-center">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4 block">
          Error 404
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
          Lost in <span className="italic text-primary">Sillage</span>
        </h1>
        <p className="font-body text-sm text-white/70 leading-relaxed mb-8">
          The fragrance or page you are looking for may have been moved, renamed, or is temporarily out of stock.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:bg-white transition-all shadow-lg"
          >
            <Compass className="h-4 w-4" />
            <span>Search Catalog (₱)</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/40 font-mono">
          Looking for wholesale or direct orders? Contact us through our social channels.
        </div>
      </div>
    </main>
  );
}
