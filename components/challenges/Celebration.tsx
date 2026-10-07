"use client";

import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444"];
const COUNT = 18;

/**
 * A short radial burst behind the success card. Purely decorative (aria-hidden)
 * and skipped entirely when the visitor prefers reduced motion; the result card
 * itself carries all the information.
 */
export default function Celebration() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden data-testid="ctf-celebration" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2;
        const dist = 70 + (i % 3) * 28;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-9 h-2 w-2 rounded-full"
            style={{ background: COLORS[i % COLORS.length] }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0.3 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: (i % 4) * 0.04 }}
          />
        );
      })}
    </div>
  );
}
