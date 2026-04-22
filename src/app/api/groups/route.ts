import { NextResponse } from 'next/server'
import { requireAuthUser } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { handleApiError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const authenticatedUser = await requireAuthUser()
    const userGroups = await groupService.listForUser(authenticatedUser.id)
    return NextResponse.json({ groups: userGroups })
  } catch (error) {
    return handleApiError(error, 'Erro ao listar grupos')
  }
}

export async function POST(request: Request) {
  try {
    const authenticatedUser = await requireAuthUser()
    const requestBody = await request.json()
    const { name, description } = requestBody

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const createdGroup = await groupService.create(name, description ?? null, authenticatedUser.id)
    return NextResponse.json({ group: createdGroup }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao criar grupo')
  }
}
