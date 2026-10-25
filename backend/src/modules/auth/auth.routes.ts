import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { csrfOrigin } from '../../middlewares/csrf-origin.js'
import { loginSchema, registerSchema } from './auth.schemas.js'
import * as auth from './auth.service.js'

export const authRoutes = Router()
const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false })

authRoutes.post('/register', csrfOrigin, authLimiter, async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Confira os campos informados.', details: parsed.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) } })
    return
  }
  try {
    const result = await auth.register(parsed.data.name, parsed.data.email, parsed.data.password, req, res)
    res.status(result.status).json(result.body)
  } catch (error) { next(error) }
})

authRoutes.post('/login', csrfOrigin, authLimiter, async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Confira os campos informados.', details: parsed.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) } })
    return
  }
  try {
    const result = await auth.login(parsed.data.email, parsed.data.password, req, res)
    res.status(result.status).json(result.body)
  } catch (error) { next(error) }
})

authRoutes.post('/refresh', csrfOrigin, authLimiter, async (req, res, next) => {
  try {
    const result = await auth.refresh(req, res)
    res.status(result.status).json(result.body)
  } catch (error) { next(error) }
})

authRoutes.post('/logout', csrfOrigin, async (req, res, next) => {
  try {
    const result = await auth.logout(req, res)
    res.status(result.status).end()
  } catch (error) { next(error) }
})

