import { FeaturedWorks } from "@/components/home/FeaturedWorks";
import { Hero } from "@/components/home/Hero";
import { MissionExcerpt } from "@/components/home/MissionExcerpt";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MissionExcerpt />
      <FeaturedWorks />
    </>
  );
}
