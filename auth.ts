import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/services/passwords";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "local-dev-auth-secret",
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? ""
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, emailVerified: new Date() },
        create: { email: user.email, name: user.name, emailVerified: new Date() }
      });
      user.id = dbUser.id;
      user.role = dbUser.role;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = "role" in user ? user.role : "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "user";
      }
      return session;
    }
  }
});
