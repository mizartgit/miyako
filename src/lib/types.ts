export type Artist = {
  slug: string;
  name: string;
  nameJa?: string;
  region: string;
  craft: string;
  portrait: string;
  carouselImages: string[];
  introShort: string;
  introFull: string;
  pullQuote?: string;
  yearsOfPractice?: string;
  workSlugs: string[];
};

export type Work = {
  slug: string;
  artistSlug: string;
  title: string;
  titleJa?: string;
  material: string;
  dimensions: string;
  story: string;
  storyJa?: string;
  images: string[];
  featured?: boolean;
};

export type InquiryType =
  | "general"
  | "specific-work"
  | "artist-partnership";

export type InquiryFormData = {
  name: string;
  email: string;
  country: string;
  inquiryType: InquiryType;
  message: string;
  workSlug?: string;
  artistSlug?: string;
};
