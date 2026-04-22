import { prisma } from '@/lib/prisma'
import { uuidv7 } from '@/lib/uuid'
import { randomBytes } from 'crypto'

export class InvitationService {
  async create(groupId: number, createdById: number, expiresInHours: number = 72) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

    return prisma.invitation.create({
      data: {
        publicId: uuidv7(),
        groupId,
        createdById,
        token,
        expiresAt,
      },
    })
  }

  async findByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: { group: { select: { id: true, name: true } } },
    })
  }

  async accept(token: string, userId: number) {
    const invitation = await this.findByToken(token)
    if (!invitation) throw new Error('Convite não encontrado')
    if (invitation.usedAt) throw new Error('Convite já utilizado')
    if (invitation.expiresAt < new Date()) throw new Error('Convite expirado')

    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: invitation.groupId } },
    })
    if (existing) throw new Error('Você já é membro deste grupo')

    await prisma.$transaction([
      prisma.groupMember.create({
        data: { userId, groupId: invitation.groupId, role: 'MEMBER' },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      }),
    ])

    return invitation.group
  }
}

export const invitationService = new InvitationService()
