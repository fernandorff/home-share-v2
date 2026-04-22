import { NextResponse } from 'next/server'
import { requireAuthUser } from '@/lib/auth'
import { platformService } from '@/services/platform.service'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    await requireAuthUser()
    const { searchParams } = new URL(request.url)
    const withCounts = searchParams.get('counts') === 'true'

    const platforms = withCounts
      ? await platformService.listWithCounts()
      : await platformService.list()

    return NextResponse.json({ platforms })
  } catch (error) {
    return handleApiError(error, 'Erro ao listar plataformas')
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthUser()
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const platform = await platformService.create(name)
    return NextResponse.json({ platform }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao criar plataforma')
  }
}
