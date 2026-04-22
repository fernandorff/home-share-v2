import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { groupService } from '@/services/group.service'
import { handleApiError } from '@/lib/api-helpers'

export async function DELETE(request: Request, { params }: { params: Promise<{ groupId: string; memberId: string }> }) {
  try {
    const { groupId: groupPublicId, memberId: memberPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    const membership = await requireGroupMember(authenticatedUser.id, group.id)
    if (membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem remover membros' }, { status: 403 })
    }

    const memberToRemove = await prisma.user.findUnique({ where: { publicId: memberPublicId } })
    if (!memberToRemove) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })

    await groupService.removeMember(group.id, memberToRemove.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Erro ao remover membro')
  }
}
