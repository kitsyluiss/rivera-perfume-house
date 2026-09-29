"use client";

/**
 * PreloaderIdent — Rivera Fragrance House (Studio-Grade)
 *
 * Choreography timeline:
 *   0.00s  Ambient gold glow scales in
 *   0.10s  Top ornament line draws
 *   0.50s  Diamond ornament fades in
 *   0.55s  "RIVERA" letters cascade in (6 × 70ms stagger, blur reveal)
 *   1.05s  "Fragrance House" subtitle fades in
 *   1.30s  Bottom diamond + line draw
 *   1.55s  Thin progress bar fills over 0.85s
 *   2.60s  Particle burst → Exit: fade out + subtle upward lift
 *   ~3.3s  Fully dismissed → onComplete fires
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;
const BRAND = "RIVERA".split("");

/* ── Particle system for exit burst ── */
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    return {
      id: i,
      x: Math.cos(angle),
      y: Math.sin(angle),
      angle,
      distance: 60 + Math.random() * 160,
      size: 1.5 + Math.random() * 3,
      delay: Math.random() * 0.15,
      duration: 0.5 + Math.random() * 0.4,
      opacity: 0.4 + Math.random() * 0.6,
    };
  });
}

export default function PreloaderIdent({
  onComplete,
  alwaysShow = false,
}: {
  onComplete?: () => void;
  alwaysShow?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const [bursting, setBursting] = useState(false);
  const prefersReduced = useReducedMotion();
  const particles = useMemo(() => generateParticles(prefersReduced ? 0 : 36), [prefersReduced]);

  useEffect(() => {
    if (alwaysShow) {
      setVisible(true);
      return;
    }
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("rivera-preloader-seen");
      if (seen === "true") {
        setVisible(false);
        onComplete?.();
      } else {
        setVisible(true);
        sessionStorage.setItem("rivera-preloader-seen", "true");
      }
    }
  }, [onComplete, alwaysShow]);

  useEffect(() => {
    if (!visible || alwaysShow) return;
    // Trigger particle burst slightly before exit
    const burstTimer = setTimeout(() => setBursting(true), 2300);
    const exitTimer = setTimeout(() => setVisible(false), 2700);
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(exitTimer);
    };
  }, [visible, alwaysShow]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="preloader-ident"
          className="preloader-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "#080706" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.75, ease }}
        >
          {/* ── grain texture ─────────────────────────── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* ── ambient gold glow ─────────────────────── */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 460,
              height: 460,
              background:
                "radial-gradient(circle, rgba(214,179,109,0.08), transparent 55%)",
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease }}
          />

          {/* ── Pulsing outer ring for depth ── */}
          <motion.div
            className="absolute pointer-events-none rounded-full border border-primary/[0.04]"
            style={{ width: 320, height: 320 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.05, 1],
              opacity: [0, 0.5, 0.3],
            }}
            transition={{ duration: 2, delay: 0.3, ease }}
          />

          {/* ── Particle burst system ── */}
          <AnimatePresence>
            {bursting &&
              particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute pointer-events-none"
                  style={{
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    backgroundColor: `rgba(214, 179, 109, ${p.opacity})`,
                    boxShadow: `0 0 ${p.size * 2}px rgba(214, 179, 109, 0.3)`,
                  }}
                  initial={{ x: 0, y: 0, opacity: p.opacity, scale: 1 }}
                  animate={{
                    x: p.x * p.distance,
                    y: p.y * p.distance,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                />
              ))}
          </AnimatePresence>

          {/* ── centre composition ────────────────────── */}
          <div className="relative flex flex-col items-center">
            {/* top line */}
            <motion.div
              className="h-px"
              style={{ backgroundColor: "rgba(214,179,109,0.28)" }}
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.55, delay: 0.1, ease }}
            />

            {/* top diamond */}
            <motion.div
              className="my-5"
              style={{
                width: 5,
                height: 5,
                transform: "rotate(45deg)",
                backgroundColor: "rgba(214,179,109,0.38)",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5, ease }}
            />

            {/* RIVERA — letter cascade with blur reveal */}
            <div className="flex items-center justify-center" style={{ paddingLeft: "0.45em" }}>
              {BRAND.map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: "clamp(1.5rem, 3.8vw, 2rem)",
                    fontWeight: 300,
                    color: "#d6b36d",
                    letterSpacing: "0.45em",
                  }}
                  initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.42,
                    delay: 0.55 + i * 0.07,
                    ease,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* subtitle */}
            <motion.p
              className="mt-2.5"
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "clamp(0.5rem, 1vw, 0.58rem)",
                fontWeight: 300,
                letterSpacing: "0.22em",
                paddingLeft: "0.22em",
                textTransform: "uppercase" as const,
                color: "#7e725b",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1.05, ease }}
            >
              Fragrance House
            </motion.p>

            {/* bottom diamond */}
            <motion.div
              className="my-5"
              style={{
                width: 5,
                height: 5,
                transform: "rotate(45deg)",
                backgroundColor: "rgba(214,179,109,0.38)",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.3, ease }}
            />

            {/* bottom line */}
            <motion.div
              className="h-px"
              style={{ backgroundColor: "rgba(214,179,109,0.28)" }}
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.55, delay: 1.3, ease }}
            />

            {/* progress bar */}
            <motion.div
              className="mt-8 overflow-hidden rounded-full"
              style={{
                width: 84,
                height: 1,
                backgroundColor: "rgba(214,179,109,0.1)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.55, duration: 0.25 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: "rgba(214,179,109,0.45)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.85, delay: 1.55, ease }}
              />
            </motion.div>

            {/* Completion glow flash */}
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 200,
                height: 200,
                background:
                  "radial-gradient(circle, rgba(214,179,109,0.15), transparent 60%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={bursting ? { scale: 1.5, opacity: [0, 1, 0] } : {}}
              transition={{ duration: 0.6, ease }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
