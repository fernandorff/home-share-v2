import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { shoppingItemService } from '@/services/shopping-item.service'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const shoppingItems = await shoppingItemService.list(group.id)
    return NextResponse.json({ items: shoppingItems })
  } catch (error) {
    return handleApiError(error, 'Erro ao listar itens')
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const requestBody = await request.json()
    const { name: itemName } = requestBody

    if (!itemName || !itemName.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const createdItem = await shoppingItemService.create(group.id, itemName, authenticatedUser.id)
    return NextResponse.json({ item: createdItem }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao criar item')
  }
}
