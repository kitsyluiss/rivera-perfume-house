import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { CONTACT_INFO } from "@/lib/contact-channels";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Review our transparent Privacy Policy under the Philippine Data Privacy Act (RA 10173). Learn how Rivera Fragrance House collects, protects, and handles your order information.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Rivera Fragrance House",
    description:
      "Transparent customer data handling, order privacy, and fulfillment security standards for Rivera Fragrance House customers.",
    url: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
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
            <li className="text-white/80">Privacy Policy</li>
          </ol>
        </nav>

        {/* Header Section */}
        <header className="mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e1b854]/30 bg-[#e1b854]/10 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-[#e1b854] mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Data Privacy Act of 2012 (RA 10173)</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-light tracking-wide mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-white/60 font-body max-w-2xl leading-relaxed">
            At Rivera Fragrance House, your personal and order data is handled with strict confidentiality. We collect only what is strictly necessary to fulfill your orders and guarantee authentic deliveries.
          </p>
          <p className="text-xs font-mono text-white/40 mt-3">
            Last Updated: {lastUpdated} &bull; Rivera Fragrance House Hub, Malabon, Metro Manila
          </p>
        </header>

        {/* Content Cards */}
        <div className="space-y-8 font-body text-sm sm:text-base leading-relaxed text-white/80">
          
          {/* Section 1 */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Eye className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                1. Information We Collect
              </h2>
            </div>
            <p className="mb-4 text-white/70">
              When you purchase or inquire about fragrances through our catalog, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong className="text-white">Customer Identity:</strong> Full name, contact number, and email address.</li>
              <li><strong className="text-white">Fulfillment Details:</strong> Complete delivery address, barangay, city, and special drop-off instructions for courier logistics.</li>
              <li><strong className="text-white">Transaction Verification:</strong> Proof of payment references (e.g., GCash, BDO/BPI transaction numbers) to confirm and release orders. We do not store raw credit card numbers.</li>
              <li><strong className="text-white">Session Preferences:</strong> Anonymous items saved in your cart and browsing filters to streamline your catalog experience.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <FileText className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                2. How Your Data is Used
              </h2>
            </div>
            <p className="mb-4 text-white/70">
              Your details are used strictly for authentic retail and wholesale fulfillment operations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li>Processing, packing, and dispatching verified factory-sealed perfume orders.</li>
              <li>Handing over delivery info to our accredited couriers (Lalamove, J&T Express, Flash Express).</li>
              <li>Direct WhatsApp, Viber, or SMS order updates and tracking numbers.</li>
              <li>Verifying batch codes and warranty inquiries for your purchased items.</li>
            </ul>
            <p className="mt-4 text-xs font-mono text-[#e1b854]/90 bg-[#e1b854]/5 p-3 rounded-xl border border-[#e1b854]/20">
              Policy Guarantee: We never sell, rent, or trade your personal information to third-party ad networks or marketing brokers.
            </p>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Lock className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                3. Data Security & Storage
              </h2>
            </div>
            <p className="text-white/70 mb-3">
              All transactions and account credentials are encrypted and stored in secure cloud infrastructure managed with Supabase. Access to order data is limited strictly to authorized fulfillment staff managing dispatches from our Malabon hub.
            </p>
            <p className="text-white/70">
              Payment verification slips uploaded to confirm bank or digital wallet transfers are preserved solely for bookkeeping and reconciliation audits.
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-white">
              <ShieldCheck className="h-5 w-5 text-[#e1b854]" />
              <h2 className="font-display text-xl sm:text-2xl font-light tracking-wide">
                4. Your Rights Under Philippine Law
              </h2>
            </div>
            <p className="mb-4 text-white/70">
              In compliance with Republic Act No. 10173 (Data Privacy Act of 2012), you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li>Access and review the personal information we hold regarding your account and past orders.</li>
              <li>Request correction or rectification of outdated contact details or shipping addresses.</li>
              <li>Request the complete deletion or erasure of your customer profile from our active systems.</li>
            </ul>
          </section>

          {/* Contact Section */}
          <section className="rounded-2xl border border-[#e1b854]/30 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="font-display text-xl sm:text-2xl font-light text-white mb-3">
              5. Privacy Questions & Requests
            </h2>
            <p className="text-white/70 mb-6 text-sm">
              If you have any questions or wish to exercise your data privacy rights, contact our Data Protection representative directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
                <Mail className="h-4 w-4 text-[#e1b854] shrink-0" />
                <span className="truncate">{CONTACT_INFO.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
                <Phone className="h-4 w-4 text-[#e1b854] shrink-0" />
                <span>{CONTACT_INFO.phoneFormatted}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
                <MapPin className="h-4 w-4 text-[#e1b854] shrink-0" />
                <span className="truncate">{CONTACT_INFO.location}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/50">
          <Link href="/terms" className="hover:text-[#e1b854] transition-colors">
            Read Terms of Service &rarr;
          </Link>
          <Link href="/catalog" className="hover:text-[#e1b854] transition-colors">
            Return to Fragrance Catalog &rarr;
          </Link>
        </div>

      </div>
    </main>
  );
}

