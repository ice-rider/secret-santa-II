import { z } from 'zod';

// Common email validation
const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Email is invalid');

// Common password validation
const passwordSchema = z.string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

// Registration schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Type inference
export type RegistrationData = z.infer<typeof registrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;