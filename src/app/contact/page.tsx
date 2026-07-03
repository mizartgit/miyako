import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Inquire about a piece or connect with MIYAKO. Each work is made to order or uniquely one-of-a-kind.",
};

function InquiryFormFallback() {
  return (
    <div className="h-96 animate-pulse border border-charcoal/10 bg-charcoal/5" />
  );
}

export default function ContactPage() {
  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              Contact
            </p>
            <h1 className="mt-6 font-serif text-4xl text-charcoal md:text-5xl">
              Begin a conversation
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-sm leading-relaxed text-charcoal/70 md:text-base">
              Each piece is made to order or uniquely one-of-a-kind. Shipping is
              handled by the artisan.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12">
              <Suspense fallback={<InquiryFormFallback />}>
                <InquiryForm />
              </Suspense>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
