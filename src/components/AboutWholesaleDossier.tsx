"use client";

import { useState } from "react";
import { ArrowRight, Copy, Check, ShieldCheck, FileCheck, Truck } from "lucide-react";
import { CONTACT_INFO, WHOLESALE_CHANNELS } from "@/lib/contact-channels";
import { toast } from "sonner";

function ChannelIcon({ id, className = "h-4 w-4" }: { id: string; className?: string }) {
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

export default function AboutWholesaleDossier() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} copied: ${text}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section className="my-24 border-t border-white/10 pt-16 text-left">
      <div className="max-w-2xl mb-12">
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#e1b854] mb-3 block">
          Wholesale &bull; Small Bulk &bull; Resellers
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-light leading-tight mb-4">
          Reseller &amp; Wholesale <span className="italic text-[#e1b854]">Partnerships</span>
        </h2>
        <p className="text-white/70 font-body text-sm sm:text-base leading-relaxed">
          We are a small, family-run fragrance shop based in Malabon. We work with independent perfume sellers, live-stream resellers, and boutique shops seeking reliable, genuine Middle Eastern and designer perfumes at fair supplier pricing.
        </p>
      </div>

      {/* 3 Step Simple Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#e1b854] text-xs font-mono uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>01. Authentic Bottles</span>
          </div>
          <h3 className="font-display text-lg text-white font-light">100% Genuine Sealed Stock</h3>
          <p className="text-xs text-white/60 font-body leading-relaxed">
            Every bottle arrives factory-sealed with original batch codes. We inspect every box personally.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#e1b854] text-xs font-mono uppercase tracking-wider">
            <FileCheck className="h-4 w-4" />
            <span>02. Batch Code Proofs</span>
          </div>
          <h3 className="font-display text-lg text-white font-light">Photos Before Dispatch</h3>
          <p className="text-xs text-white/60 font-body leading-relaxed">
            We happily provide photos of carton batch stamps and seals before packing so you can sell with confidence.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#e1b854] text-xs font-mono uppercase tracking-wider">
            <Truck className="h-4 w-4" />
            <span>03. Malabon Hub Delivery</span>
          </div>
          <h3 className="font-display text-lg text-white font-light">Metro Manila &amp; Nationwide</h3>
          <p className="text-xs text-white/60 font-body leading-relaxed">
            Fast same-day delivery across Metro Manila or secure J&amp;T / LBC courier nationwide.
          </p>
        </div>
      </div>

      {/* Direct Contact Desks - Clean Open Grid */}
      <div className="pt-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-xl text-white font-light">Direct Contact Desks</h3>
            <p className="text-xs text-white/50 font-body">Connect directly with our family team across our verified channels:</p>
          </div>
          <span className="text-[11px] font-mono text-[#e1b854] bg-[#e1b854]/10 border border-[#e1b854]/20 px-3 py-1 rounded-full w-max">
            Hub: {CONTACT_INFO.location}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHOLESALE_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-[#e1b854]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 group-hover:text-[#e1b854] group-hover:border-[#e1b854]/30 transition-colors">
                    <ChannelIcon id={ch.id} className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#e1b854]/80 bg-[#e1b854]/10 px-2 py-0.5 rounded-full">
                    {ch.badge}
                  </span>
                </div>

                <h3 className="font-display text-xl text-white font-light mb-1">{ch.name}</h3>

                <div className="flex items-center justify-between gap-1 py-1.5 border-b border-white/5 mb-3">
                  <span className="font-mono text-xs text-white/90 truncate">{ch.displayValue}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(ch.displayValue, ch.id, ch.name)}
                    className="p-1 rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                    title={`Copy ${ch.name}`}
                    aria-label={`Copy ${ch.name}`}
                  >
                    {copiedId === ch.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-white/55 font-body leading-relaxed mb-5">
                  {ch.description}
                </p>
              </div>

              <a
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full rounded-full border border-white/15 bg-white/5 py-2 px-3 text-xs font-mono font-medium text-white transition-all hover:bg-[#e1b854] hover:text-black hover:border-[#e1b854] cursor-pointer"
              >
                <span>{ch.actionText}</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
