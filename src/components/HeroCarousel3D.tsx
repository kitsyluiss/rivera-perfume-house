"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Perfume } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { motion, useMotionValue, useTransform } from "motion/react";

class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("HeroCarousel3D caught an error in ProductScene:", error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const ProductScene = dynamic(() => import("./ProductScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
    </div>
  ),
});

export default function HeroCarousel3D({
  perfumes,
  onSelect,
  selectedPerfume,
  selectionSource,
}: {
  perfumes: Perfume[];
  onSelect: (p: Perfume) => void;
  selectedPerfume?: Perfume | null;
  selectionSource?: "grid" | "carousel" | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // 1. Framer Motion robust physics value for drag
  const dragX = useMotionValue(0);
  
  // 2. Invert drag translation so Canvas stays stationary while inheriting spring physics
  const inverseX = useTransform(dragX, (v) => -v);

  // Mount on client and detect reduced motion without hiding the component
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener?.("change", handler);
    return () => mediaQuery.removeEventListener?.("change", handler);
  }, []);

  // Pause Three.js rendering when carousel is scrolled off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!mounted || perfumes.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden h-[44vh] min-h-[340px] max-h-[460px] md:h-[60vh] md:max-h-none lg:h-[70vh] border-b border-border/50">
      {/* Subtle luxury edge fade giving a distinct framed border on left & right */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-background via-background/60 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-background/60 to-transparent z-20" />
      
      {/* Heavy Liquid Drag Layer - touch-pan-y allows smooth vertical scrolling on iPad/mobile */}
      <motion.div
        drag={selectedPerfume ? false : "x"} // Disable drag when modal is open
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 120, bounceDamping: 22, power: 0.25 }}
        style={{ x: dragX }}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        <motion.div style={{ x: inverseX }} className="w-full h-full relative z-0">
          <SceneErrorBoundary>
            <ProductScene 
              perfumes={perfumes} 
              onSelect={onSelect} 
              selectedPerfume={selectedPerfume}
              dragX={dragX}
              selectionSource={selectionSource}
              isVisible={isVisible}
              reducedMotion={reducedMotion}
            />
          </SceneErrorBoundary>
        </motion.div>
      </motion.div>

    </div>
  );
}
