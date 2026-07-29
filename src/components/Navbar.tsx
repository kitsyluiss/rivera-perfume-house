"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserCircle, ShoppingCart } from "lucide-react";
import { signOut } from "@/lib/actions";
import { toast } from "sonner";

export default function Navbar({ isLoggedIn, role }: { isLoggedIn: boolean; role?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === "/admin";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/75 backdrop-blur-2xl">
      {/* Thin gold accent line at top */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(38 44% 61% / 0.6) 30%, hsl(38 44% 61% / 0.9) 50%, hsl(38 44% 61% / 0.6) 70%, transparent 100%)",
        }}
      />

      <nav className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">

        {/* Brand wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Logo SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Rivera Logo"
            className="h-8 w-8 object-contain transition-transform duration-350 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm tracking-[0.28em] text-primary sm:text-base">
              RIVERA
            </span>
            <span className="block text-[6px] tracking-[0.16em] text-muted-foreground/70 sm:text-[7px] sm:tracking-[0.14em]">
              FRAGRANCE HOUSE
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 sm:flex">
          {/* Tab pills */}
          <div className="flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] p-1">
            <Link
              href="/"
              className={`relative rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
                isActive("/")
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(38_44%_61%/0.25)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Catalog
            </Link>

            {isLoggedIn && role === 'admin' && (
              <Link
                href="/admin#inventory-list"
                className={`relative rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
                  isActive("/admin")
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(38_44%_61%/0.25)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
            {isLoggedIn && role === 'customer' && (
              <Link
                href="/orders"
                className={`relative rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
                  isActive("/orders")
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(38_44%_61%/0.25)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Orders
              </Link>
            )}
          </div>

          {/* Cart Icon & Auth button */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              title="Shopping Cart"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:bg-primary/8 hover:text-foreground"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:bg-primary/8 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                href="/login"
                title="Log In"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:bg-primary/8 hover:text-foreground"
              >
                <UserCircle className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] p-1">
            <Link
              href="/"
              className={`rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] transition-all duration-200 ${
                isActive("/")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Catalog
            </Link>

            {isLoggedIn && role === 'admin' && (
              <Link
                href="/admin#inventory-list"
                className={`rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] transition-all duration-200 ${
                  isActive("/admin")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Admin
              </Link>
            )}
            {isLoggedIn && role === 'customer' && (
              <Link
                href="/orders"
                className={`rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] transition-all duration-200 ${
                  isActive("/orders")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Orders
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              title="Shopping Cart"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-all hover:border-primary/25 hover:text-foreground"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Link>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-all hover:border-primary/25 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                href="/login"
                title="Log In"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-all hover:border-primary/25 hover:text-foreground"
              >
                <UserCircle className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}