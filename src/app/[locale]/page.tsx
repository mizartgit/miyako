import { setRequestLocale } from "next-intl/server";
import { FeaturedWorks } from "@/components/home/FeaturedWorks";
import { Hero } from "@/components/home/Hero";
import { MissionExcerpt } from "@/components/home/MissionExcerpt";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <MissionExcerpt />
      <FeaturedWorks />
    </>
  );
}
