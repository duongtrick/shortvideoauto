import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/shortvideoauto"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  EMAIL_WEBHOOK_URL: z.string().url().optional(),
  EMAIL_EVENT_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().email().default("no-reply@shortvideoauto.local"),
  STORAGE_PUBLIC_BASE_URL: z.string().url().optional(),
  BANK_NAME: z.string().default(""),
  BANK_ACCOUNT_NUMBER: z.string().default(""),
  BANK_ACCOUNT_NAME: z.string().default("")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  APP_URL: process.env.APP_URL,
  EMAIL_WEBHOOK_URL: process.env.EMAIL_WEBHOOK_URL,
  EMAIL_EVENT_WEBHOOK_SECRET: process.env.EMAIL_EVENT_WEBHOOK_SECRET,
  EMAIL_FROM: process.env.EMAIL_FROM,
  STORAGE_PUBLIC_BASE_URL: process.env.STORAGE_PUBLIC_BASE_URL,
  BANK_NAME: process.env.BANK_NAME,
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER,
  BANK_ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME
});
