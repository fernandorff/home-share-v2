"use client"

import { useState, useCallback } from 'react'
import { ExpenseSortField, SortDirection } from '@/features/grupos/types'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
        return valueToStore
      })
    } catch (error) {
      console.warn(`Error saving localStorage key "${key}":`, error)
    }
  }, [key])

  return [storedValue, setValue]
}

export interface ExpenseViewSettings {
  viewMode: 'table' | 'by-person'
  sortField: ExpenseSortField
  sortDirection: SortDirection
}

const DEFAULT_EXPENSE_VIEW_SETTINGS: ExpenseViewSettings = {
  viewMode: 'table',
  sortField: 'date',
  sortDirection: 'desc',
}

export function useExpenseViewSettings() {
  const [settings, setSettings] = useLocalStorage<ExpenseViewSettings>(
    'expense-view-settings',
    DEFAULT_EXPENSE_VIEW_SETTINGS
  )

  const updateSetting = useCallback(<K extends keyof ExpenseViewSettings>(
    field: K,
    value: ExpenseViewSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }, [setSettings])

  return { settings, setSettings, updateSetting }
}
