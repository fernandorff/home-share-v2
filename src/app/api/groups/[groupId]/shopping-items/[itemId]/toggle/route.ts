import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { shoppingItemService } from '@/services/shopping-item.service'
import { isValidUUID } from '@/lib/uuid'
import { handleApiError } from '@/lib/api-helpers'

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string; itemId: string }> }) {
  try {
    const { groupId: groupPublicId, itemId: itemPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    if (!isValidUUID(itemPublicId)) {
      return NextResponse.json({ error: 'ID de item inválido' }, { status: 400 })
    }

    const toggledItem = await shoppingItemService.togglePurchased(itemPublicId)
    return NextResponse.json({ item: toggledItem })
  } catch (error) {
    return handleApiError(error, 'Erro ao alternar item')
  }
}
