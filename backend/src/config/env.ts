import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  CORS_ORIGIN: z.string().url(),
  COOKIE_SAME_SITE: z.enum(['lax', 'none']).default('lax'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
}).superRefine((value, context) => {
  if (value.COOKIE_SAME_SITE === 'none' && value.NODE_ENV !== 'production') {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['COOKIE_SAME_SITE'], message: 'SameSite=None requires HTTPS and is only enabled in production.' })
  }
})

export const env = envSchema.parse(process.env)
