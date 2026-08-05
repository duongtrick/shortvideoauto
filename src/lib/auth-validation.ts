import { z } from "zod";

export const emailInput = z.object({
  email: z.string().email().max(255)
});

export const registerInput = emailInput.extend({
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(128)
});

export const resetPasswordInput = z.object({
  token: z.string().min(32).max(200),
  password: z.string().min(8).max(128)
});

export const changePasswordInput = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128)
});
