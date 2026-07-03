"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallax = reducedMotion ? 0 : Math.min(scrollY * 0.28, 180);
  const fade = reducedMotion ? 1 : Math.max(0, 1 - scrollY / 600);
  const textShift = reducedMotion ? 0 : scrollY * 0.15;

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${parallax}px) scale(1.08)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=85"
          alt="Tea bowl on linen"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/80"
        style={{ opacity: reducedMotion ? 0.85 : 0.85 + (1 - fade) * 0.15 }}
      />

      <div
        className="relative z-10 px-6 text-center"
        style={{
          opacity: fade,
          transform: `translateY(${textShift}px)`,
        }}
      >
        <h1 className="animate-hero-title font-serif text-6xl tracking-[0.4em] text-gold md:text-8xl lg:text-9xl">
          MIYAKO
        </h1>
      </div>

      <div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
        style={{ opacity: fade * 0.8 }}
      >
        <p className="animate-scroll-cue text-[10px] uppercase tracking-[0.35em] text-gold/60">
          Scroll
        </p>
      </div>
    </section>
  );
}
