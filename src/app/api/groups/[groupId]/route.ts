import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)
    return NextResponse.json({ group })
  } catch (error) {
    return handleApiError(error, 'Erro ao buscar grupo')
  }
}
