import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Truck, RotateCcw, AlertCircle, ChevronRight, Scale, ShieldCheck, Mail, Phone } from "lucide-react";
import { CONTACT_INFO } from "@/lib/contact-channels";

export const metadata: Metadata = {
  title: "Terms of Service & Order Guidelines | Rivera Fragrance House",
  description:
    "Review our terms of purchase, authenticity pledge, nationwide shipping conditions, return procedures, and wholesale reseller guidelines at Rivera Fragrance House.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service — Rivera Fragrance House",
    description:
      "Customer order conditions, 100% authenticity guarantee, shipping standards, and unboxing verification policies.",
    url: "/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "November 2026";

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-clip px-4 py-28 sm:py-36">
      {/* Ambient Mesh Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-gradient-mesh absolute inset-0 opacity-40" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-mono text-white/50">
            <li>
              <Link href="/" className="hover:text-[#e1b854] transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="h-3 w-3 text-white/30" /></li>
            <li className="text-white/80">Terms of Service</li>
          </ol>
        </nav>

        {/* Header Section */}
        <header className="mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e1b854]/30 bg-[#e1b854]/10 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-[#e1b854] mb-4">
            <Scale className="h-3.5 w-3.5" />
            <span>Store Terms &amp; Conditions</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-white/60 font-body max-w-2xl leading-relaxed">
            Welcome to Rivera Fragrance House. By placing an order, browsing our catalog, or registering for wholesale tiers, you agree to the conditions outlined below.
          </p>
          <p className="text-xs font-mono text-white/40 mt-3">
            Last Updated: {lastUpdated} &bull; Rivera Fragrance House, Malabon, Metro Manila
          </p>
        </header>

        {/* Content Cards */}
        <div className="space-y-8 font-body text-sm sm:text-base leading-relaxed text-white/80">
          
          {/* Section 1: Authenticity Guarantee */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <BadgeCheck className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                1. 100% Authenticity Guarantee
              </h2>
            </div>
            <p className="text-white/70 mb-3">
              Rivera Fragrance House exclusively sources brand-new, factory-sealed Middle Eastern and designer perfumes directly from authorized distributors and verified regional importers.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li>Every perfume bottle includes legible, verifiable batch codes matching the outer packaging carton.</li>
              <li>We hold a strict zero-tolerance policy against counterfeit items, class-A imitations, or opened decants presented as full bottles.</li>
              <li>If any item delivered is verifiably proven non-authentic by the brand manufacturer, we provide a 100% money-back guarantee.</li>
            </ul>
          </section>

          {/* Section 2: Pricing and Orders */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <ShieldCheck className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                2. Pricing &amp; Order Placement
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong className="text-white">Currency:</strong> All listed catalog prices are in Philippine Pesos (₱).</li>
              <li><strong className="text-white">Order Confirmation:</strong> An order is officially reserved and queued for dispatch only after valid payment proof (GCash / Bank Transfer) is received and confirmed.</li>
              <li><strong className="text-white">Inventory Real-Time Sync:</strong> Because inventory moves quickly across retail and reseller channels, in the rare event an item is sold out before payment confirmation, you will receive an immediate refund or replacement option.</li>
            </ul>
          </section>

          {/* Section 3: Shipping & Delivery */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Truck className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                3. Courier Shipping &amp; Packaging
              </h2>
            </div>
            <p className="text-white/70 mb-3">
              All fragrance orders are individually wrapped in heavy-duty multi-layer bubble wrap, placed in rigid outer shipping boxes, and sealed against transit shocks:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong className="text-white">Metro Manila:</strong> Same-day or next-day courier delivery (Lalamove, Grab, or standard courier).</li>
              <li><strong className="text-white">Provincial &amp; Nationwide:</strong> 3 to 7 business days via J&amp;T Express or Flash Express with tracking numbers provided via SMS or WhatsApp/Viber.</li>
              <li>Couriers operate independently; while we ensure expedited dispatch from our Malabon hub, delays due to severe weather or transit checkpoints are handled in active coordination with support.</li>
            </ul>
          </section>

          {/* Section 4: Returns & Replacements */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <RotateCcw className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                4. Unboxing Video Policy &amp; Returns
              </h2>
            </div>
            <p className="text-white/70 mb-3">
              Because perfumes are sealed beauty luxury goods subject to strict hygiene regulations and seal tampering risks:
            </p>
            <div className="rounded-xl border border-[#e1b854]/30 bg-[#e1b854]/5 p-4 mb-4">
              <p className="text-xs sm:text-sm text-white/90 font-medium flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#e1b854] shrink-0 mt-0.5" />
                <span><strong>Mandatory Unboxing Video:</strong> To qualify for claims of broken bottles, sprayer defects, or incorrect items, customers must take an uncut video starting from the sealed outer courier parcel through the physical bottle inspection.</span>
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li>Items with broken original plastic cellophane seals cannot be returned for "change of scent preference" due to hygiene and authenticity integrity.</li>
              <li>Eligible return or transit damage claims must be initiated within seven (7) calendar days of delivery.</li>
            </ul>
          </section>

          {/* Section 5: Wholesale & Resellers */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Scale className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                5. Wholesale &amp; Reseller Partners
              </h2>
            </div>
            <p className="text-white/70 mb-3">
              Registered resellers and boutique retail partners receiving tiered wholesale volume pricing are subject to minimum order quantities (MOQ per carton).
            </p>
            <p className="text-white/70">
              Wholesale inquiries and reserved allocations are handled directly by our trade desk via WhatsApp and Viber.
            </p>
          </section>

          {/* Contact Section */}
          <section className="rounded-2xl border border-[#e1b854]/30 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="font-display text-xl sm:text-2xl font-light text-white mb-3">
              6. Customer Support &amp; Dispute Resolution
            </h2>
            <p className="text-white/70 mb-6 text-sm">
              Our Malabon team is available Monday through Saturday to assist with inquiries, payment verifications, and order tracking:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
                <Mail className="h-4 w-4 text-[#e1b854] shrink-0" />
                <span className="truncate">{CONTACT_INFO.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
                <Phone className="h-4 w-4 text-[#e1b854] shrink-0" />
                <span>{CONTACT_INFO.phoneFormatted}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/50">
          <Link href="/privacy" className="hover:text-[#e1b854] transition-colors">
            &larr; View Privacy Policy
          </Link>
          <Link href="/catalog" className="hover:text-[#e1b854] transition-colors">
            Return to Fragrance Catalog &rarr;
          </Link>
        </div>

      </div>
    </main>
  );
}
