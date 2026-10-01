"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
