"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserCircle, ShoppingCart } from "lucide-react";
import { signOut } from "@/lib/actions";
import { toast } from "sonner";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";

export default function Navbar({ isLoggedIn, role }: { isLoggedIn: boolean; role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === "/admin";

  const navLinkClass = (href: string) =>
    `text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 hover:text-primary ${
      isActive(href) ? "text-primary" : "text-foreground"
    }`;

  const iconClass =
    "text-foreground transition-colors duration-300 hover:text-primary flex h-10 w-10 items-center justify-center";

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: isScrolled ? "rgba(5, 5, 5, 0.95)" : "transparent",
        borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        paddingTop: isScrolled ? "1rem" : "1.5rem",
        paddingBottom: isScrolled ? "1rem" : "1.5rem",
      }}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-12">
        {/* Left: Nav Links */}
        <div className="hidden items-center gap-8 sm:flex w-1/3">
          <Link href="/" className={navLinkClass("/")}>
            Catalog
          </Link>
          {isLoggedIn && role === "admin" && (
            <Link href="/admin" className={navLinkClass("/admin")}>
              Admin
            </Link>
          )}
          {isLoggedIn && role === "customer" && (
            <Link href="/orders" className={navLinkClass("/orders")}>
              Orders
            </Link>
          )}
        </div>

        {/* Center: Brand */}
        <Link href="/" className="flex flex-col items-center justify-center w-1/3 text-center group">
          <span className="font-display text-lg tracking-[0.4em] text-foreground transition-colors group-hover:text-primary sm:text-2xl">
            RIVERA
          </span>
          <span className="mt-1 block text-[7px] tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-primary">
            FRAGRANCE HOUSE
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 w-1/3">
          <Link href="/cart" aria-label="Shopping Cart" className={iconClass}>
            <ShoppingCart className="h-[18px] w-[18px] stroke-[1.5]" />
          </Link>

          {isLoggedIn ? (
            <button type="button" onClick={handleSignOut} aria-label="Sign out" className={iconClass}>
              <LogOut className="h-[18px] w-[18px] stroke-[1.5]" />
            </button>
          ) : (
            <Link href="/login" aria-label="Log In" className={iconClass}>
              <UserCircle className="h-[18px] w-[18px] stroke-[1.5]" />
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}