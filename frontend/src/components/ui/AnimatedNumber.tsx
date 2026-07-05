"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type AnimatedNumberProps = {
  value: number;
  className?: string;
  /** Cap display (e.g. badge "9+") */
  maxDisplay?: number;
};

/**
 * Ticks up or down when `value` changes — used for selection counts and quantities.
 */
export function AnimatedNumber({
  value,
  className = "",
  maxDisplay,
}: AnimatedNumberProps) {
  const prev = useRef(value);
  const [motion, setMotion] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value === prev.current) return;
    setMotion(value > prev.current ? "up" : "down");
    prev.current = value;
    const timer = setTimeout(() => setMotion(null), 480);
    return () => clearTimeout(timer);
  }, [value]);

  const display =
    maxDisplay != null && value > maxDisplay ? `${maxDisplay}+` : value;

  return (
    <span
      aria-live="polite"
      className={`relative inline-flex h-[1em] min-w-[1ch] items-center justify-center overflow-hidden tabular-nums ${className}`}
    >
      <span
        key={String(display)}
        className={
          motion === "up"
            ? "animate-count-enter-up"
            : motion === "down"
              ? "animate-count-enter-down"
              : ""
        }
      >
        {display}
      </span>
    </span>
  );
};

type AnimatedPresenceProps = {
  /** Change this to re-trigger a subtle pulse (e.g. subtotal amount). */
  watch: number | string;
  className?: string;
  children: ReactNode;
};

/** Wraps formatted values (prices, labels) with a soft scale pulse when they change. */
export function AnimatedPresence({
  watch,
  className = "",
  children,
}: AnimatedPresenceProps) {
  const prev = useRef(watch);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (watch === prev.current) return;
    prev.current = watch;
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 520);
    return () => clearTimeout(timer);
  }, [watch]);

  return (
    <span
      className={`inline-block transition-colors duration-300 ${
        pulse ? "animate-value-pulse" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}
