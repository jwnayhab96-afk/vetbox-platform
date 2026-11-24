"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  HTMLMotionProps,
  Variants,
} from "framer-motion";
import confetti from "canvas-confetti";

/**
 * Triggers a celebratory confetti explosion using VetBox brand colors.
 */
export function triggerConfetti() {
  if (typeof window === "undefined") return;

  // Primary green, forest green, mint, emerald, gold
  const colors = ["#00b664", "#045e36", "#34d399", "#10b981", "#f59e0b"];

  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.65 },
    colors: colors,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      disableForReducedMotion: true,
    });
  }, 200);
}

// -------------------------------------------------------------
// FadeIn Component
// -------------------------------------------------------------
interface FadeInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  viewportOnce?: boolean;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 20,
  viewportOnce = true,
  className,
  ...props
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  let initialX = 0;
  let initialY = 0;

  if (!shouldReduceMotion) {
    if (direction === "up") initialY = distance;
    if (direction === "down") initialY = -distance;
    if (direction === "left") initialX = distance;
    if (direction === "right") initialX = -distance;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: viewportOnce, margin: "-40px" }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------
// SlideUp Component
// -------------------------------------------------------------
export function SlideUp({
  children,
  delay = 0,
  className,
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
} & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------
// Stagger Container & Stagger Item
// -------------------------------------------------------------
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerChildren?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0.1,
  className,
  ...props
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerChildren,
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------
// Floating Element (Gentle Sine Float)
// -------------------------------------------------------------
export function FloatingElement({
  children,
  offset = 8,
  duration = 4,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  offset?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        y: [0, -offset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------
// Pulse Glow for Emergency & Live Badges
// -------------------------------------------------------------
export function PulseGlow({
  children,
  color = "rgba(0, 182, 100, 0.3)",
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center ${className || ""}`}>
      <motion.span
        className="absolute -inset-1 rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ backgroundColor: color }}
      />
      {children}
    </div>
  );
}

// -------------------------------------------------------------
// Scale On Hover / Interactive Card
// -------------------------------------------------------------
export function ScaleOnHover({
  children,
  scale = 1.02,
  elevation = true,
  className,
  ...props
}: {
  children: React.ReactNode;
  scale?: number;
  elevation?: boolean;
  className?: string;
} & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale,
              y: -3,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      className={`transition-shadow ${elevation ? "hover:shadow-lg" : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------
// Holographic Digital Card Sheen
// -------------------------------------------------------------
export function HolographicCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden group ${className || ""}`}>
      {/* Dynamic light sheen sweep */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />
      {children}
    </div>
  );
}

// -------------------------------------------------------------
// Animated Counter Component
// -------------------------------------------------------------
export function AnimatedCounter({
  from = 0,
  to,
  duration = 1.6,
  formatter = (v: number) => Math.round(v).toLocaleString("ar-EG"),
  className,
}: {
  from?: number;
  to: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}) {
  const [value, setValue] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (shouldReduceMotion) {
      setValue(to);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setValue(to);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {formatter(value)}
    </span>
  );
}

// -------------------------------------------------------------
// Page Transition Wrapper
// -------------------------------------------------------------
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Export raw framer-motion tools for advanced usage
export { motion, AnimatePresence };
