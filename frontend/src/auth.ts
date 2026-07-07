import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import {
  AuthErrorCode,
  logAuthError,
  mapDatabaseError,
} from "@/lib/auth/errors";
import {
  assertAuthEnvironment,
} from "@/lib/auth/env";
import { isDbConfigured, prisma } from "@/lib/db";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const envCheck = assertAuthEnvironment();
      if (!envCheck.success) {
        logAuthError("authorize", envCheck.code);
        return null;
      }

      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) {
        logAuthError("authorize", AuthErrorCode.INVALID_CREDENTIALS, {
          reason: "missing credentials",
        });
        return null;
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          logAuthError("authorize", AuthErrorCode.INVALID_CREDENTIALS, {
            reason: "user not found or no password",
            email: email.toLowerCase(),
          });
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          logAuthError("authorize", AuthErrorCode.INVALID_CREDENTIALS, {
            reason: "password mismatch",
            email: email.toLowerCase(),
          });
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      } catch (error) {
        const code = mapDatabaseError(error);
        logAuthError("authorize", code, error);
        return null;
      }
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: isDbConfigured() ? PrismaAdapter(prisma) : undefined,
  providers,
});
