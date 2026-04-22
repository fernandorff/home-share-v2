"use client"

import { useState, useCallback, useRef } from 'react'
import { Expense, ExpenseSortField, SortDirection } from '../types'

interface ExpenseInput {
  payerId: number
  platformId: number | null
  description: string
  notes?: string
  amount: number
  date?: string
  splitEqually?: boolean
  participants: { userId: number; amount: number }[]
}

interface PaginationParams {
  page: number
  pageSize: number
  sortField: ExpenseSortField
  sortDirection: SortDirection
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface CacheEntry {
  expenses: Expense[]
  pagination: PaginationInfo
  timestamp: number
}

const expenseCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000

function getCacheKey(groupPublicId: string, params: PaginationParams): string {
  return `${groupPublicId}-${params.page}-${params.pageSize}-${params.sortField}-${params.sortDirection}`
}

function isValidCache(entry: CacheEntry | undefined): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL
}

export function useExpenses(groupPublicId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastParams = useRef<PaginationParams | null>(null)

  const fetchExpenses = useCallback(async (params?: Partial<PaginationParams>) => {
    if (!groupPublicId) return

    const fullParams: PaginationParams = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      sortField: params?.sortField ?? 'date',
      sortDirection: params?.sortDirection ?? 'desc'
    }

    lastParams.current = fullParams

    const cacheKey = getCacheKey(groupPublicId, fullParams)
    const cached = expenseCache.get(cacheKey)

    if (isValidCache(cached)) {
      setExpenses(cached!.expenses)
      setPagination(cached!.pagination)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        page: fullParams.page.toString(),
        pageSize: fullParams.pageSize.toString(),
        sortField: fullParams.sortField,
        sortDirection: fullParams.sortDirection
      })

      const response = await fetch(`/api/groups/${groupPublicId}/expenses?${queryParams}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      expenseCache.set(cacheKey, {
        expenses: data.expenses,
        pagination: data.pagination,
        timestamp: Date.now()
      })

      setExpenses(data.expenses)
      setPagination(data.pagination)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Erro ao carregar despesas')
    } finally {
      setLoading(false)
    }
  }, [groupPublicId])

  const invalidateCache = useCallback(() => {
    expenseCache.clear()
    if (lastParams.current) {
      fetchExpenses(lastParams.current)
    }
  }, [fetchExpenses])

  const createExpense = useCallback(async (input: ExpenseInput): Promise<Expense | null> => {
    if (!groupPublicId) return null

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/groups/${groupPublicId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      invalidateCache()
      return data.expense
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Erro ao criar despesa')
      return null
    } finally {
      setLoading(false)
    }
  }, [groupPublicId, invalidateCache])

  const updateExpense = useCallback(async (
    expensePublicId: string,
    input: ExpenseInput
  ): Promise<Expense | null> => {
    if (!groupPublicId) return null

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/groups/${groupPublicId}/expenses/${expensePublicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      invalidateCache()
      return data.expense
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Erro ao atualizar despesa')
      return null
    } finally {
      setLoading(false)
    }
  }, [groupPublicId, invalidateCache])

  const deleteExpense = useCallback(async (expensePublicId: string): Promise<boolean> => {
    if (!groupPublicId) return false

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/groups/${groupPublicId}/expenses/${expensePublicId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      invalidateCache()
      return true
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao excluir despesa')
      return false
    } finally {
      setLoading(false)
    }
  }, [groupPublicId, invalidateCache])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    expenses,
    pagination,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    invalidateCache,
    clearError,
  }
}
