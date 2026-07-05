import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="bg-ink text-stone/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-2xl tracking-[0.35em] text-gold">
              MIYAKO
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone/50">
              {t("tagline")}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                {t("explore")}
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/artists" className="hover:text-gold">
                    {tNav("artists")}
                  </Link>
                </li>
                <li>
                  <Link href="/mission" className="hover:text-gold">
                    {tNav("mission")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gold">
                    {tNav("contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                {t("connect")}
              </p>
              <p className="text-sm">hello@miyako.art</p>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-stone/10 pt-8 text-[11px] tracking-wide">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
