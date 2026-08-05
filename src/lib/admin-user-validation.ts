import { z } from "zod";

export const adminUserRoles = ["user", "admin", "banned", "deleted"] as const;

export const adminUsersQuery = z.object({
  q: z.string().trim().max(120).optional(),
  role: z.enum(adminUserRoles).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0)
});

export const adminCreateUserInput = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  name: z.string().trim().min(2).max(80).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(adminUserRoles).default("user"),
  emailVerified: z.boolean().default(true)
});

export const adminUpdateUserInput = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()).optional(),
  name: z.string().trim().min(2).max(80).nullable().optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(adminUserRoles).optional(),
  emailVerified: z.boolean().optional()
});

export const adminCreditAdjustmentInput = z.object({
  delta: z.number().int().min(-100000).max(100000).refine((value) => value !== 0),
  note: z.string().trim().max(500).optional()
});

export const adminBanUserInput = z.object({
  banned: z.boolean()
});
