import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";

/**
 * Proxy (formerly `middleware.ts`, renamed per the Next.js 16 convention).
 *
 * We build a dedicated, lightweight auth instance from `authConfig` alone — it does
 * NOT import Prisma, the Prisma adapter, or bcrypt. Reading the JWT session from the
 * cookie needs no database or providers, so the proxy bundle stays tiny.
 * (Importing the full `@/auth` here is what previously pulled Prisma + bcrypt +
 * the Prisma query-engine WASM into the middleware bundle, exceeding the 1 MB Edge
 * limit.)
 */
const { auth } = NextAuth(authConfig);

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
