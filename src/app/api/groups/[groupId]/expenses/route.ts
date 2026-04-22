import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { expenseService } from '@/services/expense.service'
import { validateExpenseInput, handleApiError } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sortField = searchParams.get('sortField') || 'date'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

    const expenseListResult = await expenseService.list(group.id, { page, pageSize, sortField, sortDirection })
    return NextResponse.json(expenseListResult)
  } catch (error) {
    return handleApiError(error, 'Erro ao listar despesas')
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const groupMembers = await groupService.getMembers(group.id)
    const memberIds = groupMembers.map(member => member.user.id)

    const requestBody = await request.json()
    const validation = validateExpenseInput(requestBody, memberIds)
    if (!validation.valid) return validation.response

    const createdExpense = await expenseService.create(group.id, validation.data, memberIds)
    return NextResponse.json({ expense: createdExpense }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao criar despesa')
  }
}
