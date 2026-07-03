import Image from "next/image";

export function Hero() {
  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=85"
        alt="Tea bowl on linen"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/80" />

      <div className="relative z-10 px-6 text-center">
        <h1 className="font-serif text-6xl tracking-[0.4em] text-gold md:text-8xl lg:text-9xl">
          MIYAKO
        </h1>
        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed tracking-wide text-stone/80 md:text-base">
          Curated traditional craft from Japan &amp; China
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <p className="animate-scroll-cue text-[10px] uppercase tracking-[0.35em] text-gold/60">
          Scroll
        </p>
      </div>
    </section>
  );
}
