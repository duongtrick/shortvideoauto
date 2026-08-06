import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/services/passwords";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@shortvideoauto.local" },
    update: { emailVerified: new Date() },
    create: {
      email: "demo@shortvideoauto.local",
      name: "Demo User",
      passwordHash: hashPassword("password123"),
      emailVerified: new Date(),
      role: "user"
    }
  });

  await prisma.videoTemplate.upsert({
    where: { key: "clean_minimal" },
    update: {},
    create: {
      key: "clean_minimal",
      name: "Clean Minimal",
      config: { compositionId: "ProductShort", accent: "#0f766e" }
    }
  });

  await prisma.aIProvider.upsert({
    where: { key: "gemini" },
    update: {},
    create: {
      key: "gemini",
      name: "Gemini Flash",
      config: { model: "gemini-2.0-flash", priority: 1 }
    }
  });

  await prisma.tTSProvider.upsert({
    where: { key: "fpt" },
    update: {},
    create: {
      key: "fpt",
      name: "FPT.AI",
      config: { voice: "banmai", priority: 1 }
    }
  });

  await prisma.systemSetting.upsert({
    where: { key: "site_name" },
    update: {},
    create: {
      key: "site_name",
      value: "ShortVideoAuto",
      group: "general"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@shortvideoauto.local" },
    update: { role: "admin", emailVerified: new Date() },
    create: {
      email: "admin@shortvideoauto.local",
      name: "Demo Admin",
      passwordHash: hashPassword("password123"),
      emailVerified: new Date(),
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
