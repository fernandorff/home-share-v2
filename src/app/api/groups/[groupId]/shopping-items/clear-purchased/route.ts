import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { shoppingItemService } from '@/services/shopping-item.service'
import { handleApiError } from '@/lib/api-helpers'

export async function DELETE(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const deleteResult = await shoppingItemService.clearPurchased(group.id)
    return NextResponse.json({ deleted: deleteResult.count })
  } catch (error) {
    return handleApiError(error, 'Erro ao limpar itens comprados')
  }
}
