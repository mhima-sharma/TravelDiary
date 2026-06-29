import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  session: { strategy: "jwt" as const, maxAge: 24 * 60 * 60 },
} satisfies NextAuthConfig;
