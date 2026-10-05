"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Copy, Check, MessageCircle } from "lucide-react";
import { CONTACT_INFO, WHOLESALE_CHANNELS } from "@/lib/contact-channels";
import { toast } from "sonner";

function ChannelIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  if (id === "whatsapp") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.974.572 1.913.882 3.013.883h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.115-.494-1.785-.714-2.946-2.531-3.036-2.651-.089-.12-1.222-1.624-1.222-3.097 0-1.473.771-2.197 1.045-2.496.274-.299.598-.374.797-.374.199 0 .399.002.573.01.185.008.432-.07.676.516.249.599.848 2.07.923 2.22.075.15.125.324.025.524-.099.199-.149.324-.299.499-.15.175-.315.391-.45.525-.15.15-.307.314-.132.613.175.299.777 1.28 1.666 2.072 1.144 1.02 2.109 1.336 2.408 1.486.299.15.474.125.649-.075.175-.2.748-.873.948-1.172.199-.299.399-.249.673-.149.274.099 1.745.823 2.044.973.299.15.498.224.573.349.075.124.075.723-.069 1.128z"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.892.527 3.662 1.442 5.178L2 22l4.982-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.636 0-3.158-.466-4.449-1.272l-.319-.2-2.964.838.847-2.887-.21-.336A8.21 8.21 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z"/>
      </svg>
    );
  }
  if (id === "viber") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.8 4.2C17.6 2 14.4 1 11.2 1 5.3 1 1 5.2 1 11.1c0 2.4.8 4.7 2.3 6.6L2 22.5l5.1-1.3c1.8 1 3.9 1.6 6.1 1.6 5.9 0 10.2-4.2 10.2-10.1 0-3.2-1-6.4-3.6-8.5zM12.8 17.5c-2.3 0-4.5-.8-6.2-2.3l-.4-.4-3 1 .8-2.9-.3-.5c-1.3-1.8-2-3.9-2-6.1 0-4.8 3.5-8.4 8.2-8.4 2.5 0 4.8.8 6.5 2.5 1.7 1.7 2.6 4 2.6 6.5 0 4.8-3.4 8.6-8.2 8.6zm3.9-6.3c-.2-.1-.5-.2-1-.4-.5-.2-.8-.3-1 .1-.1.2-.4.6-.5.7-.1.1-.2.2-.4.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.4-1.3-1.6-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3.1-.1.1-.2 0-.3s-.4-1.1-.6-1.5c-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.3.1.2 1.6 2.5 3.9 3.4.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3z"/>
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.455 5.518 3.735 7.172V22l3.418-1.875c.915.253 1.884.39 2.847.39 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2zm1.002 12.445l-2.56-2.73-4.996 2.73 5.496-5.834 2.62 2.73 4.936-2.73-5.496 5.834z"/>
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function WholesaleModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} copied: ${text}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* High z-index backdrop to ALWAYS appear above the perfume detail modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[10050] bg-black/85 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />

          {/* High z-index dialog container */}
          <div className="fixed inset-0 z-[10060] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="wholesale-modal-title"
              className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="relative z-10 mb-6 pr-8">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e1b854] block mb-1.5">
                  Rivera Fragrance House &bull; Malabon Hub
                </span>
                <h2
                  id="wholesale-modal-title"
                  className="font-display text-2xl sm:text-3xl text-white font-light tracking-wide leading-tight"
                >
                  Wholesale &amp; <span className="italic text-[#e1b854]">Reseller Inquiries</span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                  Connect directly with our family team for small bulk orders, carton pricing, and batch code photos:
                </p>
              </div>

              {/* 4 Clean Channel Rows — Spacious and Non-Overlapping */}
              <div className="relative z-10 space-y-2.5 mb-6">
                {WHOLESALE_CHANNELS.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-[#e1b854]/40 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80">
                        <ChannelIcon id={ch.id} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{ch.name}</span>
                          <span className="text-[11px] font-mono text-white/50 whitespace-nowrap">{ch.displayValue}</span>
                        </div>
                        <p className="text-[11px] text-white/55 font-body truncate">
                          {ch.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button
                        type="button"
                        onClick={() => handleCopy(ch.displayValue, ch.id, ch.name)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title={`Copy ${ch.name} details`}
                        aria-label={`Copy ${ch.name}`}
                      >
                        {copiedId === ch.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <a
                        href={ch.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-[#e1b854] hover:text-black border border-white/15 px-3.5 py-1 text-xs font-mono font-medium text-white transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span>Chat</span>
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/55 font-body">
                <span className="text-[11px]">
                  Fulfillment Hub: <strong>{CONTACT_INFO.location}</strong>
                </span>
                <span className="font-mono text-[11px] text-white/50">
                  {CONTACT_INFO.phoneFormatted}
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
