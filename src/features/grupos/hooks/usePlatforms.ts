"use client"

import { useState, useCallback, useEffect } from 'react'
import { Platform } from '../types'

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlatforms = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/platforms')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlatforms(data.platforms)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar plataformas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlatforms()
  }, [fetchPlatforms])

  const createPlatform = useCallback(async (name: string): Promise<Platform | null> => {
    try {
      const res = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlatforms(prev => [...prev, data.platform].sort((a, b) => a.name.localeCompare(b.name)))
      return data.platform
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar plataforma')
      return null
    }
  }, [])

  const updatePlatform = useCallback(async (publicId: string, name: string): Promise<Platform | null> => {
    try {
      const res = await fetch(`/api/platforms/${publicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlatforms(prev =>
        prev.map(p => p.publicId === publicId ? data.platform : p)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return data.platform
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar plataforma')
      return null
    }
  }, [])

  const deletePlatform = useCallback(async (publicId: string, replacementId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/platforms/${publicId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replacementId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setPlatforms(prev => prev.filter(p => p.publicId !== publicId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir plataforma')
      return false
    }
  }, [])

  return { platforms, loading, error, fetchPlatforms, createPlatform, updatePlatform, deletePlatform }
}
