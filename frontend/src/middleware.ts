import createMiddleware from "next-intl/middleware";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const accountPattern = /^\/(en|ja)\/account(\/|$)/;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);

  if (accountPattern.test(pathname) && !isLoggedIn) {
    const locale = pathname.split("/")[1] ?? "en";
    const signInUrl = new URL(`/${locale}/sign-in`, req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
