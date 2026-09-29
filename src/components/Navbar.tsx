"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserCircle, ShoppingCart } from "lucide-react";
import { signOut } from "@/lib/actions";
import { toast } from "sonner";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { useRef, useState, useCallback, useEffect } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Magnetic pill: cursor-following glow + slight lift ── */
function MagneticPill({
  href,
  active,
  children,
  className = "",
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const glowX = useSpring(useTransform(x, [0, 1], [0, 100]), { stiffness: 300, damping: 30 });
  const glowY = useSpring(useTransform(y, [0, 1], [0, 100]), { stiffness: 300, damping: 30 });
  const glow = useMotionTemplate`radial-gradient(80px circle at ${glowX}% ${glowY}%, rgba(214,179,109,0.12), transparent 70%)`;

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width);
      y.set((e.clientY - rect.top) / rect.height);
    },
    [x, y]
  );

  return (
    <motion.div className="relative" onPointerMove={handleMove}>
      {/* Magnetic glow layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
        aria-hidden
      />
      <Link
        ref={ref}
        href={href}
        className={`relative z-10 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
          active
            ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(38_44%_61%/0.25)]"
            : "text-muted-foreground hover:text-foreground"
        } ${className}`}
      >
        {children}
      </Link>
      {/* Active indicator underline with layoutId */}
      {active && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute -bottom-0.5 left-1/2 h-px w-4 -translate-x-1/2 bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}
    </motion.div>
  );
}

/* ── Icon button with hover glow ring ── */
function GlowIconButton({
  children,
  title,
  onClick,
  href,
  badge,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
  badge?: number;
}) {
  const inner = (
    <motion.div
      whileHover={{ scale: 1.08, borderColor: "rgba(214,179,109,0.25)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-muted-foreground transition-colors duration-200 hover:bg-primary/8 hover:text-foreground"
    >
      {children}
      {badge != null && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-primary-foreground"
        >
          {badge}
        </motion.span>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} title={title}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={title}>
      {inner}
    </button>
  );
}

export default function Navbar({ isLoggedIn, role }: { isLoggedIn: boolean; role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === "/admin";

  /* ── Scroll-linked shrink ── */
  const { scrollY } = useScroll();

  // Navbar height: 56px → 44px as user scrolls past 80px
  const navPadding = useTransform(scrollY, [0, 80], [12, 6]);
  const springPadding = useSpring(navPadding, { stiffness: 200, damping: 30 });

  // Logo scale: 1 → 0.85
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.85]);
  const springLogoScale = useSpring(logoScale, { stiffness: 200, damping: 30 });

  // Gold accent line opacity: 1 → 0
  const accentOpacity = useTransform(scrollY, [0, 50], [1, 0]);
  const springAccentOpacity = useSpring(accentOpacity, { stiffness: 200, damping: 30 });

  // Backdrop blur increases on scroll
  const blurAmount = useTransform(scrollY, [0, 80], [16, 24]);
  const springBlur = useSpring(blurAmount, { stiffness: 200, damping: 30 });
  const backdropFilter = useMotionTemplate`blur(${springBlur}px)`;

  // Background opacity darkens slightly on scroll
  const bgOpacity = useTransform(scrollY, [0, 80], [0.75, 0.92]);
  const springBgOpacity = useSpring(bgOpacity, { stiffness: 200, damping: 30 });

  // If reduced motion, skip spring animations
  const pyVal = prefersReduced ? navPadding : springPadding;
  const scaleVal = prefersReduced ? logoScale : springLogoScale;
  const accentVal = prefersReduced ? accentOpacity : springAccentOpacity;

  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-white/[0.06]"
      style={{
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        backgroundColor: useMotionTemplate`rgba(9, 9, 8, ${springBgOpacity})`,
      }}
    >
      {/* Thin gold accent line at top — fades on scroll */}
      <motion.div
        className="h-px w-full"
        style={{
          opacity: accentVal,
          background:
            "linear-gradient(90deg, transparent 0%, hsl(38 44% 61% / 0.6) 30%, hsl(38 44% 61% / 0.9) 50%, hsl(38 44% 61% / 0.6) 70%, transparent 100%)",
        }}
      />

      <motion.nav
        className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: pyVal, paddingBottom: pyVal }}
      >
        {/* Brand wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          <motion.img
            src="/logo.svg"
            alt="Rivera Logo"
            className="h-8 w-8 object-contain"
            style={{ scale: scaleVal }}
            whileHover={{ rotate: 3, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
          <div className="group flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] p-1">
            <MagneticPill href="/" active={isActive("/")}>
              Catalog
            </MagneticPill>

            {isLoggedIn && role === "admin" && (
              <MagneticPill href="/admin#inventory-list" active={isActive("/admin")}>
                Dashboard
              </MagneticPill>
            )}
            {isLoggedIn && role === "customer" && (
              <MagneticPill
                href="/orders"
                active={pathname === "/orders"}
              >
                Orders
              </MagneticPill>
            )}
          </div>

          <div className="flex items-center gap-2">
            <GlowIconButton href="/cart" title="Shopping Cart">
              <ShoppingCart className="h-4 w-4" />
            </GlowIconButton>

            {isLoggedIn ? (
              <GlowIconButton onClick={handleSignOut} title="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </GlowIconButton>
            ) : (
              <GlowIconButton href="/login" title="Log In">
                <UserCircle className="h-4 w-4" />
              </GlowIconButton>
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

            {isLoggedIn && role === "admin" && (
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
            {isLoggedIn && role === "customer" && (
              <Link
                href="/orders"
                className={`rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] transition-all duration-200 ${
                  pathname === "/orders"
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
      </motion.nav>
    </motion.header>
  );
}