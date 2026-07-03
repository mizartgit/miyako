"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { submitInquiry } from "@/app/contact/actions";
import type { InquiryType } from "@/lib/types";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-gold focus:shadow-[0_1px_0_0_var(--gold)]";

const textareaClass =
  "w-full resize-none border border-charcoal/20 bg-transparent p-4 text-charcoal outline-none transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-gold focus:shadow-[0_0_0_1px_var(--gold)]";

export function InquiryForm() {
  const searchParams = useSearchParams();
  const workSlug = searchParams.get("work") ?? undefined;
  const artistSlug = searchParams.get("artist") ?? undefined;

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const defaultType: InquiryType = workSlug
    ? "specific-work"
    : artistSlug
      ? "artist-partnership"
      : "general";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await submitInquiry({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        country: formData.get("country") as string,
        inquiryType: formData.get("inquiryType") as InquiryType,
        message: formData.get("message") as string,
        workSlug,
        artistSlug,
      });

      if (response.success) {
        if (response.method === "mailto") {
          const subject = encodeURIComponent(
            `[MIYAKO Inquiry] ${formData.get("inquiryType")}`,
          );
          const body = encodeURIComponent(
            `Name: ${formData.get("name")}\nEmail: ${formData.get("email")}\nCountry: ${formData.get("country")}\n\n${formData.get("message")}`,
          );
          window.location.href = `mailto:hello@miyako.art?subject=${subject}&body=${body}`;
        }
        setResult({
          success: true,
          message:
            "Thank you. We will respond within 48 hours with next steps.",
        });
        form.reset();
      } else {
        setResult({ success: false, message: response.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {(workSlug || artistSlug) && (
        <div className="border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-charcoal/70 transition-opacity duration-500">
          {workSlug && (
            <p>Inquiring about work: {workSlug.replace(/-/g, " ")}</p>
          )}
          {artistSlug && (
            <p>Inquiring about artist: {artistSlug.replace(/-/g, " ")}</p>
          )}
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-gold-muted"
          >
            Name *
          </label>
          <input id="name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-gold-muted"
          >
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="country"
            className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-gold-muted"
          >
            Country
          </label>
          <input id="country" name="country" className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="inquiryType"
            className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-gold-muted"
          >
            Inquiry type *
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            defaultValue={defaultType}
            required
            className={fieldClass}
          >
            <option value="general">General inquiry</option>
            <option value="specific-work">Specific work</option>
            <option value="artist-partnership">Artist partnership</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-gold-muted"
        >
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={textareaClass}
        />
      </div>

      {result && (
        <p
          className={`text-sm transition-opacity duration-500 ${result.success ? "text-gold-muted" : "text-red-700"}`}
        >
          {result.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="border border-gold/50 px-10 py-4 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:bg-gold hover:text-ink hover:shadow-[0_8px_32px_rgba(201,169,98,0.25)] active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
