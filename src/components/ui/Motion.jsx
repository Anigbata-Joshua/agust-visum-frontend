"use client";

import { motion } from "framer-motion";

/**
 * Lightweight framer-motion presets used across the storefront.
 * These extend the existing CSS `.reveal` system rather than replace it.
 *
 * Usage:
 *   <FadeIn><...></FadeIn>
 *   <FadeIn delay={0.1} y={24}><...></FadeIn>
 *   <StaggerGrid>
 *     {items.map(it => <StaggerItem key={it.id}>...</StaggerItem>)}
 *   </StaggerGrid>
 */
const baseTransition = { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] };

export function FadeIn({
  children,
  y = 20,
  delay = 0,
  duration = 0.6,
  className,
  as = "div",
  ...props
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerGrid({
  children,
  className,
  delayChildren = 0.05,
  staggerChildren = 0.07,
  ...props
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: {
          transition: { delayChildren, staggerChildren },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 18, ...props }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: baseTransition },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stiffer upward fade — used for large editorial blocks where a small
 * `FadeIn` (y=20) reads as too gentle.
 */
export function FadeUp({
  children,
  y = 36,
  delay = 0,
  duration = 0.7,
  className,
  as = "div",
  ...props
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

export default FadeIn;
