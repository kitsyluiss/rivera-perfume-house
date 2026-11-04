"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STORAGE_KEY = "rivera_cookie_consent_v1";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Subtle delay for a polished luxury load experience
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage unavailable in private mode
    }
  }, []);

  const handleConsent = (level: "accepted" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, level);
    } catch {
      // Fallback
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl p-5 shadow-2xl shadow-black/90 text-white font-body">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#e1b854]/10 border border-[#e1b854]/30 text-[#e1b854]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-display text-sm font-medium tracking-wide text-white">
                  Privacy &amp; Cookie Consent
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleConsent("essential")}
                aria-label="Dismiss cookie notice"
                className="text-white/40 hover:text-white transition-colors p-1 -mr-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              We use essential session storage to preserve your cart, batch codes, and authentic order delivery preferences in full compliance with the{" "}
              <strong className="text-white font-normal">Philippine Data Privacy Act (RA 10173)</strong>. Learn more in our{" "}
              <Link
                href="/privacy"
                className="text-[#e1b854] hover:underline underline-offset-2 transition-colors font-mono text-[11px]"
              >
                Privacy Policy
              </Link>
              .
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleConsent("accepted")}
                className="flex-1 h-9 rounded-xl bg-gradient-to-r from-[#f9d976] to-[#bd9135] text-black text-xs font-semibold uppercase tracking-[0.15em] hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#e1b854]/20"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleConsent("essential")}
                className="h-9 px-3.5 rounded-xl border border-white/15 bg-white/[0.04] text-white/70 hover:text-white hover:border-white/30 text-xs font-mono uppercase tracking-wider active:scale-95 transition-all"
              >
                Essential
              </button>
            </div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

