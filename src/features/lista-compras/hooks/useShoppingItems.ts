"use client"

import { useState, useEffect, useCallback } from 'react'
import { ShoppingItem } from '../types'

export function useShoppingItems(groupPublicId: string | null) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!groupPublicId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupPublicId}/shopping-items`)
      if (!response.ok) throw new Error('Failed to fetch items')
      const data = await response.json()
      setItems(data.items)
      setError(null)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Error loading items')
    } finally {
      setLoading(false)
    }
  }, [groupPublicId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = useCallback(async (name: string): Promise<boolean> => {
    if (!groupPublicId) return false

    try {
      const response = await fetch(`/api/groups/${groupPublicId}/shopping-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error('Failed to add item')
      const data = await response.json()
      setItems(previousItems => [data.item, ...previousItems])
      return true
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Error adding item')
      return false
    }
  }, [groupPublicId])

  const updateItem = useCallback(async (publicId: string, name: string): Promise<boolean> => {
    if (!groupPublicId) return false

    try {
      const response = await fetch(`/api/groups/${groupPublicId}/shopping-items/${publicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error('Failed to update item')
      const data = await response.json()
      setItems(previousItems => previousItems.map(item => item.publicId === publicId ? data.item : item))
      return true
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Error updating item')
      return false
    }
  }, [groupPublicId])

  const deleteItem = useCallback(async (publicId: string): Promise<boolean> => {
    if (!groupPublicId) return false

    let itemsSnapshot: ShoppingItem[] = []
    setItems(previousItems => {
      itemsSnapshot = previousItems
      return previousItems.filter(item => item.publicId !== publicId)
    })
    try {
      const response = await fetch(`/api/groups/${groupPublicId}/shopping-items/${publicId}`, { method: 'DELETE' })
      if (!response.ok) {
        setItems(itemsSnapshot)
        throw new Error('Failed to delete item')
      }
      return true
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error deleting item')
      return false
    }
  }, [groupPublicId])

  const toggleItem = useCallback(async (publicId: string) => {
    if (!groupPublicId) return

    // Optimistic update
    setItems(previousItems => {
      const updatedItems = previousItems.map(item =>
        item.publicId === publicId ? { ...item, isPurchased: !item.isPurchased } : item
      )
      return sortItems(updatedItems)
    })

    try {
      const response = await fetch(`/api/groups/${groupPublicId}/shopping-items/${publicId}/toggle`, { method: 'PATCH' })
      if (!response.ok) {
        await fetchItems() // Revert on error
      }
    } catch {
      await fetchItems()
    }
  }, [groupPublicId, fetchItems])

  const clearPurchased = useCallback(async (): Promise<boolean> => {
    if (!groupPublicId) return false

    let itemsSnapshot: ShoppingItem[] = []
    setItems(previousItems => {
      itemsSnapshot = previousItems
      return previousItems.filter(item => !item.isPurchased)
    })
    try {
      const response = await fetch(`/api/groups/${groupPublicId}/shopping-items/clear-purchased`, { method: 'DELETE' })
      if (!response.ok) {
        setItems(itemsSnapshot)
        throw new Error('Failed to clear purchased')
      }
      return true
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : 'Error clearing purchased')
      return false
    }
  }, [groupPublicId])

  return { items, loading, error, addItem, updateItem, deleteItem, toggleItem, clearPurchased }
}

function sortItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.isPurchased !== secondItem.isPurchased) return firstItem.isPurchased ? 1 : -1
    return new Date(secondItem.createdAt).getTime() - new Date(firstItem.createdAt).getTime()
  })
}
