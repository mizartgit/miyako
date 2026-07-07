import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth/env";

/**
 * Edge-safe auth configuration.
 *
 * This file must NOT import Prisma, the Prisma adapter, bcrypt, or any Node-only
 * dependency, because it is consumed by `proxy.ts` which runs on the Edge runtime.
 * Keeping it lean is what keeps the Edge (proxy) bundle small.
 */

export const authConfig = {
  secret: getAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
