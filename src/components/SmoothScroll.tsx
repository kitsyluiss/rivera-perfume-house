"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only init if not preferring reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Monks.com-grade Crispy Smooth Scroll Configuration
    // Uses tuned linear interpolation (lerp) for instant, responsive pickup
    // and rapid, silky settling without sluggish lag or inertia overshoot.
    const lenis = new Lenis({
      lerp: 0.085, // The exact Awwwards / Media.Monks sweet spot: crisp, responsive, buttery
      wheelMultiplier: 1.0, // 1:1 natural input mapping
      touchMultiplier: 1.0, // Natural 1:1 touch response without erratic acceleration
      smoothWheel: true,
      syncTouch: false, // Keep native hardware touch momentum on mobile devices
      autoResize: true,
    });

    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    // High-precision RAF loop synchronized with browser refresh rate (60/120Hz)
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Reset scroll cleanly on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
