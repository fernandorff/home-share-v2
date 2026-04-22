import { prisma } from '@/lib/prisma'
import { uuidv7 } from '@/lib/uuid'

export class GroupService {
  async listForUser(userId: number) {
    return prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: { user: { select: { id: true, publicId: true, name: true, isGuest: true } } },
        },
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(groupId: number) {
    return prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { select: { id: true, publicId: true, name: true, email: true, isGuest: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })
  }

  async findByPublicId(publicId: string) {
    return prisma.group.findUnique({
      where: { publicId },
      include: {
        members: {
          include: { user: { select: { id: true, publicId: true, name: true, email: true, isGuest: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })
  }

  async create(name: string, description: string | null, adminUserId: number) {
    return prisma.group.create({
      data: {
        publicId: uuidv7(),
        name: name.trim(),
        description: description?.trim() || null,
        members: {
          create: { userId: adminUserId, role: 'ADMIN' },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, publicId: true, name: true, isGuest: true } } },
        },
      },
    })
  }

  async addGuestMember(groupId: number, guestName: string) {
    const guestUser = await prisma.user.create({
      data: {
        publicId: uuidv7(),
        name: guestName.trim(),
        isGuest: true,
      },
    })

    await prisma.groupMember.create({
      data: { userId: guestUser.id, groupId, role: 'MEMBER' },
    })

    return guestUser
  }

  async removeMember(groupId: number, userId: number) {
    return prisma.groupMember.delete({
      where: { userId_groupId: { userId, groupId } },
    })
  }

  async getMembers(groupId: number) {
    return prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: { id: true, publicId: true, name: true, isGuest: true } } },
      orderBy: { joinedAt: 'asc' },
    })
  }
}

export const groupService = new GroupService()
