"use client";

/**
 * PreloaderIdent — Rivera Fragrance House
 *
 * High-precision luxury asset gating preloader.
 * Monitors Drei's useProgress() to ensure 100% of 3D textures, WebGL assets,
 * and shaders are fully decoded and compiled before the page curtain lifts.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useProgress } from "@react-three/drei";

const ease = [0.16, 1, 0.3, 1] as const;
const BRAND = "RIVERA".split("");

export default function PreloaderIdent({
  onComplete,
  alwaysShow = false,
  subtitle = "An Olfactory Gallery",
}: {
  onComplete?: () => void;
  alwaysShow?: boolean;
  subtitle?: string;
}) {
  const [visible, setVisible] = useState(true);
  const { active, progress } = useProgress();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 1. Minimum luxury choreography window (1.4s) to allow letter cascade to complete
  useEffect(() => {
    const t = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  // 2. Dismiss only when choreography has finished AND all 3D assets are 100% loaded
  useEffect(() => {
    if (alwaysShow) {
      setVisible(true);
      return;
    }

    // Both the minimum presentation time has passed and Three.js loading is inactive
    if (minTimeElapsed && (!active || progress >= 100)) {
      setVisible(false);
      try {
        sessionStorage.setItem("rivera-preloader-seen", "true");
      } catch (e) {}
      onComplete?.();
    } else {
      setVisible(true);
    }
  }, [minTimeElapsed, active, progress, alwaysShow, onComplete]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="preloader-ident"
          className="preloader-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "#060606" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.75, ease }}
        >
          {/* Subtle grain texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Ambient gold glow */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 480,
              height: 480,
              background:
                "radial-gradient(circle, rgba(214,179,109,0.08), transparent 60%)",
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease }}
          />

          {/* Centre composition */}
          <div className="relative flex flex-col items-center">
            {/* Top ornament line */}
            <motion.div
              className="h-px"
              style={{ backgroundColor: "rgba(214,179,109,0.3)" }}
              initial={{ width: 0 }}
              animate={{ width: 44 }}
              transition={{ duration: 0.45, delay: 0.05, ease }}
            />

            {/* Top diamond */}
            <motion.div
              className="my-4"
              style={{
                width: 4,
                height: 4,
                transform: "rotate(45deg)",
                backgroundColor: "rgba(214,179,109,0.45)",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2, ease }}
            />

            {/* RIVERA — Letter cascade */}
            <div className="flex items-center justify-center" style={{ paddingLeft: "0.45em" }}>
              {BRAND.map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                    fontWeight: 300,
                    color: "#d6b36d",
                    letterSpacing: "0.45em",
                  }}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.45,
                    delay: 0.25 + i * 0.05,
                    ease,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.p
              className="mt-2.5"
              style={{
                fontFamily: '"Lora", serif',
                fontSize: "clamp(0.55rem, 1.1vw, 0.65rem)",
                fontWeight: 400,
                letterSpacing: "0.35em",
                paddingLeft: "0.35em",
                textTransform: "uppercase" as const,
                color: "rgba(255, 255, 255, 0.6)",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease }}
            >
              {subtitle}
            </motion.p>

            {/* Bottom diamond */}
            <motion.div
              className="my-4"
              style={{
                width: 4,
                height: 4,
                transform: "rotate(45deg)",
                backgroundColor: "rgba(214,179,109,0.45)",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8, ease }}
            />

            {/* Bottom line */}
            <motion.div
              className="h-px"
              style={{ backgroundColor: "rgba(214,179,109,0.3)" }}
              initial={{ width: 0 }}
              animate={{ width: 44 }}
              transition={{ duration: 0.45, delay: 0.8, ease }}
            />

            {/* Hairline Gold Progress Bar */}
            <motion.div
              className="mt-6 overflow-hidden rounded-full relative"
              style={{
                width: 72,
                height: 1,
                backgroundColor: "rgba(214,179,109,0.12)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <motion.div
                className="h-full rounded-full absolute left-0 top-0"
                style={{
                  backgroundColor: "#e1b854",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(15, progress)}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
