import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'

export function csrfOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('origin')
  const csrfHeader = req.get('x-csrf-token')
  if (origin !== env.CORS_ORIGIN || !csrfHeader) {
    res.status(403).json({ error: { code: 'CSRF_REJECTED', message: 'A origem da solicitação não foi aceita.', details: [] } })
    return
  }
  next()
}
