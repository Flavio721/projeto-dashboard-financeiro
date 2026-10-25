import type { NextFunction, Request, Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { env } from '../config/env.js'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const value = req.header('authorization')
  if (!value?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária.', details: [] } })
    return
  }

  try {
    const payload = jwt.verify(value.slice(7), env.JWT_ACCESS_SECRET) as JwtPayload
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') throw new Error('Invalid token claims')
    req.auth = { userId: payload.sub, email: payload.email }
    next()
  } catch {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Sessão inválida ou expirada.', details: [] } })
  }
}
