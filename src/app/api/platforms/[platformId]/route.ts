import { NextResponse } from 'next/server'
import { requireAuthUser } from '@/lib/auth'
import { isValidUUID } from '@/lib/uuid'
import { platformService } from '@/services/platform.service'
import { handleApiError } from '@/lib/api-helpers'

interface RouteParams {
  params: Promise<{ platformId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAuthUser()
    const { platformId } = await params
    if (!isValidUUID(platformId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const platform = await platformService.update(platformId, name)
    return NextResponse.json({ platform })
  } catch (error) {
    return handleApiError(error, 'Erro ao atualizar plataforma')
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAuthUser()
    const { platformId } = await params
    if (!isValidUUID(platformId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { replacementId } = body

    if (!replacementId || !isValidUUID(replacementId)) {
      return NextResponse.json({ error: 'Plataforma substituta é obrigatória' }, { status: 400 })
    }

    await platformService.delete(platformId, replacementId)
    return NextResponse.json({ message: 'Plataforma excluída com sucesso' })
  } catch (error) {
    return handleApiError(error, 'Erro ao excluir plataforma')
  }
}
