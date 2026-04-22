import { NextResponse } from 'next/server'

export function handleApiError(error: unknown, defaultMsg: string): NextResponse {
  console.error(defaultMsg, error)
  const message = error instanceof Error ? error.message : defaultMsg
  return NextResponse.json({ error: message }, { status: 500 })
}

interface ExpenseInputRaw {
  description?: string
  notes?: string
  amount?: number
  date?: string
  payerId?: number
  platformId?: number
  splitEqually?: boolean
  participants?: { userId: number; amount: number }[]
}

export interface ValidatedExpenseInput {
  description: string
  notes?: string
  amount: number
  date?: Date
  payerId: number
  platformId?: number | null
  splitEqually: boolean
  participants: { userId: number; amount: number }[]
}

export function validateExpenseInput(
  body: ExpenseInputRaw,
  validPayerIds: number[],
  options: { payerRequired?: boolean } = {}
): { valid: true; data: ValidatedExpenseInput } | { valid: false; response: NextResponse } {
  const { description, notes, amount, date, payerId, platformId, splitEqually = true, participants = [] } = body
  const { payerRequired = true } = options

  if (!description || description.trim() === '') {
    return { valid: false, response: NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 }) }
  }

  if (!amount || amount <= 0) {
    return { valid: false, response: NextResponse.json({ error: 'Valor deve ser maior que zero' }, { status: 400 }) }
  }

  if (payerRequired && (!payerId || !validPayerIds.includes(payerId))) {
    return { valid: false, response: NextResponse.json({ error: 'Pagador inválido' }, { status: 400 }) }
  }

  if (!payerRequired && payerId && !validPayerIds.includes(payerId)) {
    return { valid: false, response: NextResponse.json({ error: 'Pagador inválido' }, { status: 400 }) }
  }

  if (!splitEqually && participants.length > 0) {
    const totalParticipants = participants.reduce((sum, p) => sum + p.amount, 0)
    if (Math.abs(totalParticipants - amount) > 0.01) {
      return {
        valid: false,
        response: NextResponse.json({
          error: `Soma dos valores dos participantes (${totalParticipants.toFixed(2)}) difere do valor total (${amount.toFixed(2)})`
        }, { status: 400 })
      }
    }
  }

  return {
    valid: true,
    data: {
      description,
      notes,
      amount,
      date: date ? new Date(date + (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? 'T12:00:00' : '')) : undefined,
      payerId: payerId!,
      platformId: platformId ?? null,
      splitEqually,
      participants,
    }
  }
}
