export type ExpenseSortField = 'description' | 'payer' | 'date' | 'amount' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface Platform {
  id: number
  publicId: string
  name: string
}

export interface Expense {
  id: number
  publicId: string
  groupId: number
  payerId: number
  platformId: number | null
  description: string
  notes: string | null
  amount: number
  date: string
  createdAt: string
  payer: {
    id: number
    publicId: string
    name: string
  }
  platform: Platform | null
  participants: ExpenseParticipant[]
}

export interface ExpenseParticipant {
  id: number
  expenseId: number
  userId: number
  amount: number
  user: {
    id: number
    publicId: string
    name: string
  }
}

export interface Balance {
  userId: number
  userName: string
  balance: number
}

export interface SimplifiedDebt {
  from: { id: number; name: string }
  to: { id: number; name: string }
  amount: number
}

export interface CreateExpenseInput {
  payerId: number
  description: string
  notes?: string
  amount: number
  date?: string
  participants: {
    userId: number
    amount: number
  }[]
}
