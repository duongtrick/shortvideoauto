import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@shortvideoauto.local" },
    update: {},
    create: {
      email: "demo@shortvideoauto.local",
      name: "Demo User",
      role: "user"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@shortvideoauto.local" },
    update: { role: "admin" },
    create: {
      email: "admin@shortvideoauto.local",
      name: "Demo Admin",
      role: "admin"
    }
  });

  console.log("seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
