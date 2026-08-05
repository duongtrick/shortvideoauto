import { prisma } from "@/lib/prisma";
import { auth } from "../../auth";

const demoUserEmail = "demo@shortvideoauto.local";

export async function getCurrentUser() {
  const session = await auth();
  if (session?.user?.email) {
    return prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role ?? "user"
      }
    });
  }

  if (process.env.ALLOW_DEMO_AUTH !== "true" && process.env.NODE_ENV === "production") {
    throw new Error("Authentication required.");
  }

  return prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: { email: demoUserEmail, name: "Demo User" }
  });
}

export async function requireCurrentUser() {
  return getCurrentUser();
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "admin") {
    throw new Error("Admin access required.");
  }
  return user;
}
