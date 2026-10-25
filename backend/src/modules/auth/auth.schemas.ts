import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(10).max(128),
}).strict()

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(1).max(128),
}).strict()

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  profile: z.enum(['CONSERVADOR', 'MODERADO', 'ARROJADO']).optional(),
  monthlyExpenses: z.number().finite().positive().max(100_000_000).nullable().optional(),
}).strict()
