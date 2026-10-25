import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import pinoHttpModule from 'pino-http'
import { env } from './config/env.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { userRoutes } from './modules/users/users.routes.js'

export const app = express()

app.disable('x-powered-by')
if (env.NODE_ENV === 'production') app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'] }))
app.use(express.json({ limit: '10kb', strict: true }))
app.use(cookieParser())
app.use(pinoHttpModule.default({ redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie', 'req.body.password', 'req.body.token'], censor: '[REDACTED]' } }))
app.use(rateLimit({ windowMs: 15 * 60_000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.', details: [] } })
})

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  req.log.error({ err: error }, 'Unhandled request error')
  if (res.headersSent) return
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível concluir a solicitação.', details: [] } })
}
app.use(errorHandler)
