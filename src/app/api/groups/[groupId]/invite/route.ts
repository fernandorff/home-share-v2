import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { invitationService } from '@/services/invitation.service'
import { handleApiError } from '@/lib/api-helpers'

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    const membership = await requireGroupMember(authenticatedUser.id, group.id)
    if (membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem criar convites' }, { status: 403 })
    }

    const createdInvitation = await invitationService.create(group.id, authenticatedUser.id)
    return NextResponse.json({ invitation: createdInvitation }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao criar convite')
  }
}
