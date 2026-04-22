import { prisma } from '@/lib/prisma'
import { uuidv7 } from '@/lib/uuid'
import { parseCSV, ExpenseRow } from '@/lib/csv-parser'

export interface CreateExpenseInput {
  payerId: number
  platformId?: number | null
  description: string
  notes?: string | null
  amount: number
  date?: Date
  participants?: { userId: number; amount: number }[]
  splitEqually?: boolean
}

export interface UpdateExpenseInput {
  payerId?: number
  platformId?: number | null
  description?: string
  notes?: string | null
  amount?: number
  date?: Date
  participants?: { userId: number; amount: number }[]
  splitEqually?: boolean
}

export interface ImportExpenseResult {
  created: ExpenseRow[]
  errors: { description: string; error: string }[]
  totalValue: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortField: string
  sortDirection: 'asc' | 'desc'
}

const expenseInclude = {
  payer: { select: { id: true, publicId: true, name: true } },
  platform: { select: { id: true, publicId: true, name: true } },
  participants: {
    include: {
      user: { select: { id: true, publicId: true, name: true } }
    }
  }
}

export class ExpenseService {
  async list(groupId: number, params: PaginationParams) {
    const { page, pageSize, sortField, sortDirection } = params

    let orderBy: Record<string, 'asc' | 'desc'> | { payer: { name: 'asc' | 'desc' } }
    if (sortField === 'payer') {
      orderBy = { payer: { name: sortDirection } }
    } else {
      orderBy = { [sortField]: sortDirection }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: { groupId },
        include: expenseInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.expense.count({ where: { groupId } })
    ])

    return {
      expenses,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  async findByPublicId(publicId: string) {
    return prisma.expense.findUnique({
      where: { publicId },
      include: expenseInclude
    })
  }

  async create(groupId: number, input: CreateExpenseInput, memberIds: number[]) {
    const { payerId, platformId, description, notes, amount, date, participants, splitEqually } = input

    let participantData: { userId: number; amount: number }[]

    if (splitEqually || !participants || participants.length === 0) {
      const amountPerPerson = amount / memberIds.length
      participantData = memberIds.map(userId => ({
        userId,
        amount: Math.round(amountPerPerson * 100) / 100
      }))
    } else {
      participantData = participants
    }

    return prisma.expense.create({
      data: {
        publicId: uuidv7(),
        groupId,
        payerId,
        platformId,
        description: description.trim(),
        notes: notes?.trim() || null,
        amount,
        date: date ?? new Date(),
        participants: { create: participantData }
      },
      include: expenseInclude
    })
  }

  async update(expenseId: number, input: UpdateExpenseInput, memberIds: number[]) {
    const { payerId, platformId, description, notes, amount, date, participants, splitEqually } = input

    let participantData: { userId: number; amount: number }[] | undefined

    if (amount !== undefined) {
      if (splitEqually || !participants || participants.length === 0) {
        const amountPerPerson = amount / memberIds.length
        participantData = memberIds.map(userId => ({
          userId,
          amount: Math.round(amountPerPerson * 100) / 100
        }))
      } else {
        participantData = participants
      }
    }

    return prisma.$transaction(async (tx) => {
      if (participantData) {
        await tx.expenseParticipant.deleteMany({
          where: { expenseId }
        })
      }

      return tx.expense.update({
        where: { id: expenseId },
        data: {
          ...(payerId !== undefined && { payerId }),
          ...(platformId !== undefined && { platformId }),
          ...(description && { description: description.trim() }),
          ...(notes !== undefined && { notes: notes?.trim() || null }),
          ...(amount !== undefined && { amount }),
          ...(date && { date }),
          ...(participantData && {
            participants: { create: participantData }
          })
        },
        include: expenseInclude
      })
    })
  }

  async delete(expenseId: number) {
    await prisma.expense.delete({ where: { id: expenseId } })
  }

  async bulkDelete(expenseIds: number[]) {
    const result = await prisma.expense.deleteMany({
      where: { id: { in: expenseIds } }
    })
    return result.count
  }

  async importFromCSV(
    groupId: number,
    csvText: string,
    payerId: number,
    platformId: number | null,
    splitEqually: boolean,
    memberIds: number[]
  ): Promise<ImportExpenseResult> {
    const expenses = parseCSV(csvText)

    if (expenses.length === 0) {
      throw new Error('No valid expenses found in CSV')
    }

    const created: ExpenseRow[] = []
    const errors: { description: string; error: string }[] = []

    for (const expense of expenses) {
      try {
        const participantData = memberIds.map(userId => ({
          userId,
          amount: splitEqually
            ? expense.valor / memberIds.length
            : (userId === payerId ? expense.valor : 0)
        }))

        await prisma.expense.create({
          data: {
            publicId: uuidv7(),
            groupId,
            payerId,
            platformId,
            description: expense.descricao,
            notes: expense.observacao || null,
            amount: expense.valor,
            date: new Date(expense.data),
            participants: { create: participantData }
          }
        })

        created.push(expense)
      } catch (err) {
        errors.push({
          description: expense.descricao,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return {
      created,
      errors,
      totalValue: created.reduce((sum, e) => sum + e.valor, 0)
    }
  }

  async exportToCSV(groupId: number): Promise<string> {
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payer: { select: { name: true } },
        platform: { select: { name: true } },
        participants: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    })

    const escapeCSV = (value: string | null | undefined): string => {
      if (!value) return ''
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const BOM = '\uFEFF'
    const header = 'Date,Description,Notes,Amount,Paid by,Platform,Participants'

    const rows = expenses.map(e => {
      const dateStr = new Date(e.date).toLocaleDateString('pt-BR')
      const amountStr = Number(e.amount).toFixed(2).replace('.', ',')
      const participantNames = e.participants.map(p => p.user.name).join('; ')

      return [
        dateStr,
        escapeCSV(e.description),
        escapeCSV(e.notes),
        amountStr,
        escapeCSV(e.payer.name),
        escapeCSV(e.platform?.name),
        escapeCSV(participantNames)
      ].join(',')
    })

    return BOM + [header, ...rows].join('\n')
  }
}

export const expenseService = new ExpenseService()
