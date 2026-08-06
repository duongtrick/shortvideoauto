import { prisma } from "@/lib/prisma";
import { auth } from "../../auth";

const demoUserEmail = "demo@shortvideoauto.local";
const blockedRoles = new Set(["banned", "deleted"]);

export class AuthAccessError extends Error {
  constructor(public code: "unauthenticated" | "forbidden") {
    super(code === "unauthenticated" ? "Authentication required." : "Access forbidden.");
  }
}

export function adminAuthStatus(error: unknown) {
  return error instanceof AuthAccessError && error.code === "unauthenticated" ? 401 : 403;
}

function assertActiveUser<T extends { role: string }>(user: T) {
  if (blockedRoles.has(user.role)) {
    throw new Error("Account disabled.");
  }
  return user;
}

export async function getCurrentUser() {
  const session = await auth();
  if (session?.user?.email) {
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role ?? "user"
      }
    });
    return assertActiveUser(user);
  }

  if (process.env.ALLOW_DEMO_AUTH !== "true" && process.env.NODE_ENV === "production") {
    throw new Error("Authentication required.");
  }

  const user = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: { email: demoUserEmail, name: "Demo User" }
  });
  return assertActiveUser(user);
}

export async function requireCurrentUser() {
  return getCurrentUser();
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new AuthAccessError("unauthenticated");
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || blockedRoles.has(user.role)) {
    throw new AuthAccessError("unauthenticated");
  }

  if (user.role !== "admin") {
    throw new AuthAccessError("forbidden");
  }
  return user;
}
