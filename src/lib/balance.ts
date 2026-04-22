import { toNumber } from '@/lib/currency'
import { CURRENCY_EPSILON } from '@/lib/constants'
import { Balance, SimplifiedDebt } from '@/features/grupos/types'

export type { Balance, SimplifiedDebt }

export interface ExpenseForBalance {
  payerId: number
  payer: { id: number; name: string }
  amount: number | string | { toString(): string }
  participants: {
    userId: number
    user: { id: number; name: string }
    amount: number | string | { toString(): string }
  }[]
}

export function calculateBalances(expenses: ExpenseForBalance[]): Balance[] {
  const balanceMap = new Map<number, { name: string; balance: number }>()

  for (const expense of expenses) {
    const expenseValue = toNumber(expense.amount)

    const payerBalance = balanceMap.get(expense.payerId) || {
      name: expense.payer.name,
      balance: 0
    }
    payerBalance.balance += expenseValue
    balanceMap.set(expense.payerId, payerBalance)

    for (const participant of expense.participants) {
      const partValue = toNumber(participant.amount)
      const pBalance = balanceMap.get(participant.userId) || {
        name: participant.user.name,
        balance: 0
      }
      pBalance.balance -= partValue
      balanceMap.set(participant.userId, pBalance)
    }
  }

  return Array.from(balanceMap.entries())
    .map(([userId, data]) => ({
      userId,
      userName: data.name,
      balance: Math.round(data.balance * 100) / 100
    }))
    .sort((a, b) => b.balance - a.balance)
}

export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  const creditors = balances
    .filter(b => b.balance > CURRENCY_EPSILON)
    .map(b => ({ ...b, remaining: b.balance }))

  const debtors = balances
    .filter(b => b.balance < -CURRENCY_EPSILON)
    .map(b => ({ ...b, remaining: Math.abs(b.balance) }))

  const settlements: SimplifiedDebt[] = []

  creditors.sort((a, b) => b.remaining - a.remaining)
  debtors.sort((a, b) => b.remaining - a.remaining)

  for (const debtor of debtors) {
    while (debtor.remaining > CURRENCY_EPSILON) {
      const creditor = creditors.find(c => c.remaining > CURRENCY_EPSILON)
      if (!creditor) break

      const amount = Math.min(debtor.remaining, creditor.remaining)

      if (amount > CURRENCY_EPSILON) {
        settlements.push({
          from: { id: debtor.userId, name: debtor.userName },
          to: { id: creditor.userId, name: creditor.userName },
          amount: Math.round(amount * 100) / 100
        })

        debtor.remaining -= amount
        creditor.remaining -= amount
      }
    }
  }

  return settlements
}
