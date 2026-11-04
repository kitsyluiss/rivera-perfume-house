"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { signOut } from "@/lib/actions";
import { toast } from "sonner";
import { CONTACT_INFO } from "@/lib/contact-channels";

interface NavbarProps {
  isLoggedIn: boolean;
  role?: string;
}

export default function Navbar({ isLoggedIn, role }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    setMobileMenuOpen(false);
    router.refresh();
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Catalog", href: "/catalog", badge: "Live ₱" },
    { label: "Collections", href: "/collections" },
    { label: "The Atelier", href: "/atelier" },
    { label: "Fragrance Journal", href: "/journal" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <>
      <header
        data-navbar
        className="fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-6 sm:py-4 md:px-8 bg-transparent pointer-events-none transition-all duration-300"
      >
        <nav className="flex items-center justify-between w-full max-w-7xl mx-auto backdrop-blur-md bg-white/[0.03] rounded-full border border-white/5 px-4 sm:px-6 py-2.5 sm:py-3 pointer-events-auto shadow-2xl">
          
          {/* Left: Brand / Logo */}
          <div className="flex-1">
            <Link
              href="/"
              className="font-display text-xl sm:text-2xl font-bold tracking-widest text-white hover:text-white/80 transition-colors"
            >
              .rivera
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop only) */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <Link
              href="/catalog"
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              Catalog
            </Link>
            <Link
              href="/collections"
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              Collections <ChevronDown className="w-3 h-3 opacity-50" />
            </Link>
            <Link
              href="/atelier"
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors"
            >
              The Atelier
            </Link>
            <Link
              href="/journal"
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors"
            >
              Journal
            </Link>
            <Link
              href="/about"
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              About Us <ChevronDown className="w-3 h-3 opacity-50" />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="flex h-8 sm:h-9 items-center justify-center rounded-full bg-white px-4 sm:px-5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-black transition-transform hover:scale-105 active:scale-95 shadow-md"
                >
                  Connect
                </Link>
                <Link
                  href="/cart"
                  aria-label="View shopping cart"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
                >
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </>
            ) : (
              <>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex h-9 items-center justify-center rounded-full bg-white/10 px-4 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
                  >
                    Admin
                  </Link>
                )}
                {role === "customer" && (
                  <Link
                    href="/orders"
                    className="hidden sm:flex h-9 items-center justify-center rounded-full bg-white/10 px-4 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
                  >
                    Orders
                  </Link>
                )}
                <Link
                  href="/cart"
                  aria-label="View shopping cart"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
                >
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Mobile Menu Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all touch-manipulation"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer (Luxury Slide-over Sheet) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden pointer-events-auto"
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Drawer"
              className="fixed inset-y-0 right-0 z-50 w-[88vw] max-w-sm bg-black/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl md:hidden pointer-events-auto text-white overflow-y-auto"
              style={{
                paddingTop: "max(1.5rem, env(safe-area-inset-top))",
                paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
              }}
            >
              {/* Drawer Top Header */}
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#f9d976] to-[#bd9135]"
                  >
                    .rivera
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all touch-manipulation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Primary Nav Links */}
                <nav className="flex flex-col py-4 gap-1">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between h-12 px-3 rounded-xl transition-all ${
                        pathname === item.href
                          ? "bg-white/10 text-white border border-[#e1b854]/40"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="font-display text-base tracking-wide">{item.label}</span>
                      {item.badge ? (
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e1b854] bg-[#e1b854]/10 border border-[#e1b854]/30 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white/30" />
                      )}
                    </Link>
                  ))}

                  <div className="h-px bg-white/10 my-3" />

                  {/* Legal & Policy Quick Access */}
                  <div className="flex flex-col gap-1 text-xs font-mono text-white/50">
                    <Link
                      href="/privacy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-3 rounded-lg hover:text-[#e1b854] transition-colors"
                    >
                      Privacy Policy &bull; RA 10173
                    </Link>
                    <Link
                      href="/terms"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-3 rounded-lg hover:text-[#e1b854] transition-colors"
                    >
                      Terms &bull; Unboxing Policy
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Drawer Bottom Actions & Concierge */}
              <div className="pt-5 border-t border-white/10 space-y-3">
                {/* Account / Session Row */}
                {isLoggedIn ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#e1b854]/20 border border-[#e1b854]/40 flex items-center justify-center text-[#e1b854]">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white capitalize">{role || "Customer"}</p>
                        <p className="text-[10px] font-mono text-white/50">Active Session</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-mono text-white/60 hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] text-white text-xs font-medium uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Concierge Direct Contact Button */}
                <a
                  href={CONTACT_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-wider text-white hover:border-[#25D366]/50 active:scale-95 transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp Concierge</span>
                </a>

                {/* Hub Location Note */}
                <p className="text-[10px] font-mono text-center text-white/40 pt-1">
                  Rivera Fragrance House &bull; Malabon, Metro Manila
                </p>
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
