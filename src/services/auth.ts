import { prisma } from "@/lib/prisma";

const demoUserEmail = "demo@shortvideoauto.local";

export async function getCurrentUser() {
  return prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: { email: demoUserEmail, name: "Demo User" }
  });
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "admin") {
    throw new Error("Admin access required.");
  }
  return user;
}
