import { createHash, randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'

const REFRESH_COOKIE = 'financas_refresh'
const REFRESH_DAYS = 21
const MAX_FAILED_LOGINS = 5
const LOCK_MINUTES = 15

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function issueAccessToken(user: { id: string; email: string }) {
  return jwt.sign({ email: user.email }, env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: '15m' })
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
    maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
  })
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
  })
}

async function createRefreshSession(userId: string, req: Request, res: Response) {
  const token = randomBytes(48).toString('base64url')
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      userAgent: req.get('user-agent')?.slice(0, 300),
    },
  })
  setRefreshCookie(res, token)
}

export async function register(name: string, email: string, password: string, req: Request, res: Response) {
  const passwordHash = await bcrypt.hash(password, 12)
  let user
  try {
    user = await prisma.$transaction(async transaction => {
      const created = await transaction.user.create({ data: { name, email, passwordHash }, select: { id: true, name: true, email: true, profile: true, monthlyExpenses: true } })
      await transaction.auditLog.create({ data: { userId: created.id, action: 'REGISTER' } })
      return created
    })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return { status: 409 as const, body: { error: { code: 'EMAIL_IN_USE', message: 'Não foi possível criar a conta com esses dados.', details: [] } } }
    }
    throw error
  }
  await createRefreshSession(user.id, req, res)
  return { status: 201 as const, body: { accessToken: issueAccessToken(user), user } }
}

export async function login(email: string, password: string, req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { email } })
  const now = new Date()
  if (!user || (user.lockedUntil && user.lockedUntil > now)) {
    if (user) await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN_FAILED' } })
    return { status: 401 as const, body: { error: { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.', details: [] } } }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const failedLogins = user.failedLogins + 1
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins, lockedUntil: failedLogins >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
    })
    await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN_FAILED' } })
    return { status: 401 as const, body: { error: { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.', details: [] } } }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null },
    select: { id: true, name: true, email: true, profile: true, monthlyExpenses: true },
  })
  await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN' } })
  await createRefreshSession(user.id, req, res)
  return { status: 200 as const, body: { accessToken: issueAccessToken(updatedUser), user: updatedUser } }
}

export async function refresh(req: Request, res: Response) {
  const currentToken = req.cookies?.[REFRESH_COOKIE]
  if (typeof currentToken !== 'string') return { status: 401 as const, body: { error: { code: 'INVALID_REFRESH_TOKEN', message: 'Sessão expirada. Entre novamente.', details: [] } } }

  const tokenHash = hashToken(currentToken)
  const session = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: { select: { id: true, name: true, email: true, profile: true, monthlyExpenses: true } } } })
  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    clearRefreshCookie(res)
    return { status: 401 as const, body: { error: { code: 'INVALID_REFRESH_TOKEN', message: 'Sessão expirada. Entre novamente.', details: [] } } }
  }

  const nextToken = randomBytes(48).toString('base64url')
  const nextHash = hashToken(nextToken)
  const rotated = await prisma.$transaction(async transaction => {
    const revoked = await transaction.refreshToken.updateMany({ where: { id: session.id, revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } })
    if (revoked.count !== 1) return false
    await transaction.refreshToken.create({ data: { userId: session.userId, tokenHash: nextHash, expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000), userAgent: req.get('user-agent')?.slice(0, 300) } })
    return true
  })
  if (!rotated) {
    clearRefreshCookie(res)
    return { status: 401 as const, body: { error: { code: 'INVALID_REFRESH_TOKEN', message: 'Sessão expirada. Entre novamente.', details: [] } } }
  }
  setRefreshCookie(res, nextToken)
  return { status: 200 as const, body: { accessToken: issueAccessToken(session.user), user: session.user } }
}

export async function logout(req: Request, res: Response) {
  const currentToken = req.cookies?.[REFRESH_COOKIE]
  if (typeof currentToken === 'string') {
    await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(currentToken), revokedAt: null }, data: { revokedAt: new Date() } })
  }
  clearRefreshCookie(res)
  return { status: 204 as const }
}
