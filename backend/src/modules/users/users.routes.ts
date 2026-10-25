import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { prisma } from '../../lib/prisma.js'
import { profileSchema } from '../auth/auth.schemas.js'

export const userRoutes = Router()
userRoutes.use(authenticate)

userRoutes.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { id: true, name: true, email: true, profile: true, monthlyExpenses: true, createdAt: true } })
    if (!user) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Conta não encontrada.', details: [] } })
      return
    }
    res.json({ user })
  } catch (error) { next(error) }
})

userRoutes.patch('/me', async (req, res, next) => {
  const parsed = profileSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Confira os campos informados.', details: parsed.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) } })
    return
  }
  if (!Object.keys(parsed.data).length) {
    res.status(400).json({ error: { code: 'EMPTY_UPDATE', message: 'Informe ao menos um campo para atualizar.', details: [] } })
    return
  }
  try {
    const user = await prisma.$transaction(async transaction => {
      const updated = await transaction.user.update({ where: { id: req.auth!.userId }, data: parsed.data, select: { id: true, name: true, email: true, profile: true, monthlyExpenses: true } })
      await transaction.auditLog.create({ data: { userId: req.auth!.userId, action: 'PROFILE_UPDATED' } })
      return updated
    })
    res.json({ user })
  } catch (error) { next(error) }
})

userRoutes.delete('/me', async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.auditLog.create({ data: { userId: req.auth!.userId, action: 'ACCOUNT_DELETED' } }),
      prisma.user.delete({ where: { id: req.auth!.userId } }),
    ])
    res.status(204).end()
  } catch (error) { next(error) }
})
