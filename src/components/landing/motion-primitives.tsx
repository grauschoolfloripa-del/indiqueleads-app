import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useSpring, animate } from "motion/react";

/**
 * Small, reusable motion building blocks for the landing page.
 * Kept intentionally simple (no scroll-linked scrubbing, no pinning) so the
 * page stays cheap on low-end mobile — see ui-ux-pro-max "Standard" tier.
 */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "span";
}

/** Fades + slides an element in once, when it enters the viewport. */
export function Reveal({ children, delay = 0, y = 20, className, as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </Component>
  );
}

/** Stagger container — children should be plain elements; wrap each in <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Animates a number counting up from 0 once it scrolls into view. */
export function CountUp({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => {
        setDisplay(
          v.toLocaleString("pt-BR", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
        );
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/** Same idea, but for a value that already changes live (e.g. a calculator result) — no viewport gate, just smooth tweening between values. */
export function LiveNumber({
  value,
  decimals = 2,
  prefix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 120, damping: 20, mass: 0.6 });
  const [display, setDisplay] = useState(
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(
        v.toLocaleString("pt-BR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      );
    });
    return unsub;
  }, [spring, decimals]);

  return (
    <span className={className}>
      {prefix}
      {display}
    </span>
  );
}

/** Decorative ambient gradient blob — slow, subtle, GPU-cheap (transform-only). */
export function GlowBlob({
  className,
  color = "var(--color-royal-500)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
      style={{ background: color }}
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.35, 0.5, 0.35],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Infinite horizontal marquee — duplicates children once for a seamless loop. */
export function Marquee({
  children,
  className,
  durationSec = 28,
}: {
  children: ReactNode;
  className?: string;
  durationSec?: number;
}) {
  return (
    <div className={`group relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex w-max items-center gap-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: durationSec, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center gap-10 group-hover:[animation-play-state:paused]">
          {children}
        </div>
        <div aria-hidden className="flex items-center gap-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Button wrapper with a subtle magnetic hover + press feedback. */
export function MagneticButton({
  children,
  className,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
