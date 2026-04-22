import { NextResponse } from 'next/server'
import { requireAuthUser, requireGroupMember } from '@/lib/auth'
import { groupService } from '@/services/group.service'
import { expenseService } from '@/services/expense.service'
import { handleApiError } from '@/lib/api-helpers'

async function parseImportRequestBody(request: Request, validPayerIds: number[]) {
  const contentType = request.headers.get('content-type') || ''

  let csvText: string
  let splitEqually = true
  let payerId: number = validPayerIds[0]
  let platformId: number = 0

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new Error('Arquivo CSV não enviado')
    }

    csvText = await file.text()

    const splitEquallyParam = formData.get('splitEqually')
    if (splitEquallyParam !== null) {
      splitEqually = splitEquallyParam === 'true'
    }

    const payerParam = formData.get('payerId')
    if (payerParam) {
      const parsedPayerId = parseInt(payerParam.toString())
      if (validPayerIds.includes(parsedPayerId)) {
        payerId = parsedPayerId
      }
    }

    const platformParam = formData.get('platformId')
    if (platformParam) {
      platformId = parseInt(platformParam.toString())
    }
  } else if (contentType.includes('application/json')) {
    const requestBody = await request.json()
    csvText = requestBody.csv
    if (requestBody.splitEqually !== undefined) {
      splitEqually = requestBody.splitEqually
    }
    if (requestBody.payerId && validPayerIds.includes(parseInt(requestBody.payerId))) {
      payerId = parseInt(requestBody.payerId)
    }
    if (requestBody.platformId) {
      platformId = parseInt(requestBody.platformId)
    }
  } else {
    csvText = await request.text()
  }

  return { csvText, splitEqually, payerId, platformId }
}

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: groupPublicId } = await params
    const authenticatedUser = await requireAuthUser()
    const group = await groupService.findByPublicId(groupPublicId)
    if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
    await requireGroupMember(authenticatedUser.id, group.id)

    const groupMembers = await groupService.getMembers(group.id)
    const memberIds = groupMembers.map(member => member.user.id)

    const { csvText, splitEqually, payerId, platformId } = await parseImportRequestBody(request, memberIds)

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json({ error: 'CSV vazio' }, { status: 400 })
    }

    if (!platformId) {
      return NextResponse.json({ error: 'Plataforma é obrigatória' }, { status: 400 })
    }

    const importResult = await expenseService.importFromCSV(
      group.id,
      csvText,
      payerId,
      platformId,
      splitEqually,
      memberIds
    )

    return NextResponse.json({
      message: `${importResult.created.length} despesas importadas com sucesso`,
      created: importResult.created.length,
      errors: importResult.errors.length,
      errorDetails: importResult.errors.length > 0 ? importResult.errors : undefined,
      totalValue: importResult.totalValue,
      expenses: importResult.created,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Erro ao importar despesas')
  }
}
