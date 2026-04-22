import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidUUID } from '@/lib/uuid'
import { groupService } from '@/services/group.service'
import { expenseService } from '@/services/expense.service'
import { handleApiError } from '@/lib/api-helpers'

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const { publicIds } = await request.json()

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json({ error: 'Lista de IDs é obrigatória' }, { status: 400 })
    }

    for (const expensePublicId of publicIds) {
      if (!isValidUUID(expensePublicId)) {
        return NextResponse.json({ error: `ID inválido: ${expensePublicId}` }, { status: 400 })
      }
    }

    const expensesToDelete = await prisma.expense.findMany({
      where: {
        publicId: { in: publicIds },
        groupId: group.id,
      },
      select: { id: true },
    })

    if (expensesToDelete.length === 0) {
      return NextResponse.json({ error: 'Nenhuma despesa encontrada' }, { status: 404 })
    }

    const deletedCount = await expenseService.bulkDelete(expensesToDelete.map(expense => expense.id))

    return NextResponse.json({
      message: `${deletedCount} despesa(s) excluída(s) com sucesso`,
      deleted: deletedCount,
    })
  } catch (error) {
    return handleApiError(error, 'Erro ao excluir despesas em lote')
  }
}
