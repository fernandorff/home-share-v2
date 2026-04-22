import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { expenseService } from '@/services/expense.service'
import { isValidUUID } from '@/lib/uuid'
import { validateExpenseInput, handleApiError } from '@/lib/api-helpers'

interface RouteParams {
  params: Promise<{ groupId: string; expenseId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { groupId: groupPublicId, expenseId: expensePublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    if (!isValidUUID(expensePublicId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const expense = await expenseService.findByPublicId(expensePublicId)
    if (!expense || expense.groupId !== group.id) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ expense })
  } catch (error) {
    return handleApiError(error, 'Erro ao buscar despesa')
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { groupId: groupPublicId, expenseId: expensePublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    if (!isValidUUID(expensePublicId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const existingExpense = await expenseService.findByPublicId(expensePublicId)
    if (!existingExpense || existingExpense.groupId !== group.id) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    const groupMembers = await groupService.getMembers(group.id)
    const memberIds = groupMembers.map(member => member.user.id)

    const requestBody = await request.json()
    const validation = validateExpenseInput(requestBody, memberIds)
    if (!validation.valid) return validation.response

    const updatedExpense = await expenseService.update(existingExpense.id, validation.data, memberIds)
    return NextResponse.json({ expense: updatedExpense })
  } catch (error) {
    return handleApiError(error, 'Erro ao atualizar despesa')
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { groupId: groupPublicId, expenseId: expensePublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    if (!isValidUUID(expensePublicId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const expense = await expenseService.findByPublicId(expensePublicId)
    if (!expense || expense.groupId !== group.id) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    await expenseService.delete(expense.id)
    return NextResponse.json({ message: 'Despesa excluída com sucesso' })
  } catch (error) {
    return handleApiError(error, 'Erro ao excluir despesa')
  }
}
