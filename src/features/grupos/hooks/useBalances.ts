"use client"

import { useState, useCallback } from 'react'
import { Balance, SimplifiedDebt } from '@/lib/balance'

interface UseBalancesReturn {
  balances: Balance[]
  settlements: SimplifiedDebt[]
  totalExpenses: number
  loading: boolean
  error: string | null
  fetchBalances: () => Promise<void>
}

export function useBalances(groupPublicId: string | null): UseBalancesReturn {
  const [balances, setBalances] = useState<Balance[]>([])
  const [settlements, setSettlements] = useState<SimplifiedDebt[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!groupPublicId) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/groups/${groupPublicId}/balances`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setBalances(data.balances)
      setSettlements(data.settlements)
      setTotalExpenses(data.totalExpenses)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Erro ao carregar saldos')
    } finally {
      setLoading(false)
    }
  }, [groupPublicId])

  return {
    balances,
    settlements,
    totalExpenses,
    loading,
    error,
    fetchBalances,
  }
}
