import { prisma } from '@/lib/prisma'
import { uuidv7 } from '@/lib/uuid'

export class PlatformService {
  async list() {
    return prisma.platform.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async listWithCounts() {
    return prisma.platform.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { expenses: true } } },
    })
  }

  async findByPublicId(publicId: string) {
    return prisma.platform.findUnique({ where: { publicId } })
  }

  async create(name: string) {
    return prisma.platform.create({
      data: {
        publicId: uuidv7(),
        name: name.trim(),
      },
    })
  }

  async update(publicId: string, name: string) {
    const platform = await this.findByPublicId(publicId)
    if (!platform) throw new Error('Plataforma não encontrada')

    return prisma.platform.update({
      where: { id: platform.id },
      data: { name: name.trim() },
    })
  }

  async delete(publicId: string, replacementPublicId: string) {
    const platform = await this.findByPublicId(publicId)
    if (!platform) throw new Error('Plataforma não encontrada')

    const replacement = await this.findByPublicId(replacementPublicId)
    if (!replacement) throw new Error('Plataforma substituta não encontrada')

    return prisma.$transaction(async (tx) => {
      await tx.expense.updateMany({
        where: { platformId: platform.id },
        data: { platformId: replacement.id },
      })

      return tx.platform.delete({ where: { id: platform.id } })
    })
  }

  async getExpenseCount(platformId: number): Promise<number> {
    return prisma.expense.count({ where: { platformId } })
  }
}

export const platformService = new PlatformService()
