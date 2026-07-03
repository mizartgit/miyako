import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiryForm } from "@/components/contact/InquiryForm";

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
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            Contact
          </p>
          <h1 className="mt-6 font-serif text-4xl text-charcoal md:text-5xl">
            Begin a conversation
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-charcoal/70 md:text-base">
            Each piece is made to order or uniquely one-of-a-kind. We connect
            you directly with the artist. Shipping is handled by the artisan.
          </p>

          <div className="mt-12">
            <Suspense fallback={<InquiryFormFallback />}>
              <InquiryForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
