"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShoppingCart, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/actions";
import { toast } from "sonner";

export default function Navbar({ isLoggedIn, role }: { isLoggedIn: boolean; role?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.refresh();
  };

  return (
    <header data-navbar className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 bg-transparent pointer-events-none transition-all duration-300">
      <nav className="flex items-center justify-between w-full max-w-7xl mx-auto backdrop-blur-md bg-white/[0.03] rounded-full border border-white/5 px-6 py-3 pointer-events-auto shadow-2xl">
        
        {/* Left: Brand / Logo */}
        <div className="flex-1">
          <Link href="/" className="font-display text-xl md:text-2xl font-bold tracking-widest text-white hover:text-white/80 transition-colors">
            .rivera
          </Link>
        </div>

        {/* Center: Navigation Links (Hidden on small screens) */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          <Link href="/catalog" className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1">
            Catalog
          </Link>
          <Link href="/collections" className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1">
            Collections <ChevronDown className="w-3 h-3 opacity-50" />
          </Link>
          <Link href="/atelier" className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors">
            The Atelier
          </Link>
          <Link href="/journal" className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors">
            Journal
          </Link>
          <Link href="/about" className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1">
            About Us <ChevronDown className="w-3 h-3 opacity-50" />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 flex-1">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="flex h-9 items-center justify-center rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-wider text-black transition-transform hover:scale-105 active:scale-95"
              >
                Connect
              </Link>
              <Link
                href="/signup"
                aria-label="Create account"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ShoppingCart className="h-4 w-4" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}