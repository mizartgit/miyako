import Link from "next/link";

type InquiryButtonProps = {
  href: string;
  label?: string;
};

export function InquiryButton({
  href,
  label = "Inquire about this piece",
}: InquiryButtonProps) {
  return (
    <Link
      href={href}
      className="inline-block border border-gold/50 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-ink"
    >
      {label}
    </Link>
  );
}
