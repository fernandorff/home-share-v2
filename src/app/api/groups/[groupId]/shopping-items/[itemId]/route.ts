import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { shoppingItemService } from '@/services/shopping-item.service'
import { isValidUUID } from '@/lib/uuid'
import { handleApiError } from '@/lib/api-helpers'

interface RouteParams {
  params: Promise<{ groupId: string; itemId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { groupId: groupPublicId, itemId: itemPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    if (!isValidUUID(itemPublicId)) {
      return NextResponse.json({ error: 'ID de item inválido' }, { status: 400 })
    }

    const requestBody = await request.json()
    const { name: itemName } = requestBody

    if (!itemName || !itemName.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const updatedItem = await shoppingItemService.update(itemPublicId, itemName)
    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    return handleApiError(error, 'Erro ao atualizar item')
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { groupId: groupPublicId, itemId: itemPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    if (!isValidUUID(itemPublicId)) {
      return NextResponse.json({ error: 'ID de item inválido' }, { status: 400 })
    }

    await shoppingItemService.delete(itemPublicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Erro ao excluir item')
  }
}
