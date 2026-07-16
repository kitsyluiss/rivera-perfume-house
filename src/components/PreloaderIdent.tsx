"use client";

/**
 * PreloaderIdent — Rivera Perfume House
 *
 * Choreography timeline:
 *   0.00s  Ambient gold glow scales in
 *   0.10s  Top ornament line draws
 *   0.50s  Diamond ornament fades in
 *   0.55s  "RIVERA" letters cascade in (6 × 70ms stagger, blur reveal)
 *   1.05s  "Perfume House" subtitle fades in
 *   1.30s  Bottom diamond + line draw
 *   1.55s  Thin progress bar fills over 0.85s
 *   2.60s  Exit: fade out + subtle upward lift
 *   ~3.3s  Fully dismissed → onComplete fires
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;
const BRAND = "RIVERA".split("");

export default function PreloaderIdent({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="preloader-ident"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
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

            {/* RIVERA — letter cascade */}
            <div className="flex items-center justify-center">
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
                letterSpacing: "0.42em",
                textTransform: "uppercase" as const,
                color: "#7e725b",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1.05, ease }}
            >
              Perfume House
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
