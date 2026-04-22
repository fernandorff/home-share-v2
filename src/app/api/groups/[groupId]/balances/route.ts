import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { groupService } from '@/services/group.service'
import { calculateBalances, simplifyDebts } from '@/lib/balance'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const expenses = await prisma.expense.findMany({
      where: { groupId: group.id },
      include: {
        payer: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    const balances = calculateBalances(expenses)
    const settlements = simplifyDebts(balances)
    const totalExpenses = balances.reduce((sum, balance) => sum + Math.max(0, balance.balance), 0)

    return NextResponse.json({
      balances,
      settlements,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
    })
  } catch (error) {
    return handleApiError(error, 'Erro ao calcular saldos')
  }
}
