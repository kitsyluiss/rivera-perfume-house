"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Perfume } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";

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
  const [mounted, setMounted] = useState(false);
  
  // 1. Framer Motion robust physics value for drag
  const dragX = useMotionValue(0);
  
  // 2. Invert drag translation so Canvas stays stationary while inheriting spring physics
  const inverseX = useTransform(dragX, (v) => -v);

  // Only render on client, and respect reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      setMounted(true);
    }
  }, []);

  if (!mounted || perfumes.length === 0) {
    return null; // Fallback to normal layout if reduced motion or SSR
  }

  return (
    <div className="relative w-full overflow-hidden h-[60vh] min-h-[400px] lg:h-[70vh] border-b border-border/50">
      
      {/* Heavy Liquid Drag Layer */}
      <motion.div
        drag={selectedPerfume ? false : "x"} // Disable drag when modal is open
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 120, bounceDamping: 22, power: 0.25 }}
        style={{ x: dragX }}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
      >
        <motion.div style={{ x: inverseX }} className="w-full h-full relative z-0">
          <ProductScene 
            perfumes={perfumes} 
            onSelect={onSelect} 
            selectedPerfume={selectedPerfume}
            dragX={dragX}
            selectionSource={selectionSource}
          />
        </motion.div>
      </motion.div>

    </div>
  );
}
