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
    const groupMembers = await groupService.getMembers(group.id)
    return NextResponse.json({ members: groupMembers })
  } catch (error) {
    return handleApiError(error, 'Erro ao listar membros')
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    const membership = await requireGroupMember(authenticatedUser.id, group.id)
    if (membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem adicionar membros' }, { status: 403 })
    }

    const requestBody = await request.json()
    const { name: guestMemberName } = requestBody
    if (!guestMemberName || !guestMemberName.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const createdGuestMember = await groupService.addGuestMember(group.id, guestMemberName)
    return NextResponse.json({ member: createdGuestMember }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao adicionar membro')
  }
}
