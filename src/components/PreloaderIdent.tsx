"use client";

/**
 * PreloaderIdent — Editorial Style
 * Pure, stark typography fade. No cheap effects.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PreloaderIdent({
  onComplete,
  alwaysShow = false,
}: {
  onComplete?: () => void;
  alwaysShow?: boolean;
}) {
  const [visible, setVisible] = useState(true);

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
    const exitTimer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(exitTimer);
  }, [visible, alwaysShow]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="preloader-ident"
          className="preloader-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease }}
        >
          <div className="relative flex flex-col items-center">
            <motion.h1
              className="font-display font-light text-primary"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "0.5em",
                paddingLeft: "0.5em",
              }}
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: [0.2, 0, 0.2, 1] }}
            >
              RIVERA
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
