"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CONTACT_INFO } from "@/lib/contact-channels";

export default function StickyMobileCTA() {
  const pathname = usePathname();

  // Hide on admin routes, checkout, login/signup flows, or if already in full checkout
  const isExcludedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forgot-password");

  if (isExcludedRoute) {
    return null;
  }

  const isCatalog = pathname === "/catalog";
  const isProduct = pathname.startsWith("/perfumes/");

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Mobile Quick Actions"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-auto"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-3 my-1 rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl p-2.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-2.5">
          {/* Left: Quick Inquire / WhatsApp Support */}
          <a
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with fragrance concierge on WhatsApp"
            className="flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white hover:border-[#e1b854]/40 active:scale-95 transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            <span>Inquire</span>
          </a>

          {/* Right: Primary Conversion Button */}
          {isCatalog ? (
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-[#f9d976] to-[#bd9135] text-black font-semibold text-xs uppercase tracking-[0.15em] shadow-lg shadow-[#e1b854]/20 active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Filter Perfumes</span>
            </a>
          ) : isProduct ? (
            <Link
              href="/cart"
              className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-[#f9d976] to-[#bd9135] text-black font-semibold text-xs uppercase tracking-[0.15em] shadow-lg shadow-[#e1b854]/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>View Cart &bull; Checkout</span>
            </Link>
          ) : (
            <Link
              href="/catalog"
              className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-[#f9d976] to-[#bd9135] text-black font-semibold text-xs uppercase tracking-[0.15em] shadow-lg shadow-[#e1b854]/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Browse Fragrances (₱)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

