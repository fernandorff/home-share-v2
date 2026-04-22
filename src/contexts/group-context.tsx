"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface GroupMember {
  id: number
  publicId: string
  name: string
  email?: string | null
  isGuest: boolean
}

interface GroupMemberWithRole {
  id: number
  userId: number
  groupId: number
  role: 'ADMIN' | 'MEMBER'
  user: GroupMember
}

interface GroupData {
  id: number
  publicId: string
  name: string
  description: string | null
  members: GroupMemberWithRole[]
  _count: { expenses: number }
}

interface GroupContextValue {
  activeGroup: GroupData | null
  groups: GroupData[]
  groupMembersList: GroupMember[]
  activeGroupPublicId: string | null
  needsOnboarding: boolean
  isLoadingGroups: boolean
  refreshGroups: () => Promise<void>
  setActiveGroupByPublicId: (publicId: string) => void
}

const GroupContext = createContext<GroupContextValue | null>(null)

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<GroupData[]>([])
  const [activeGroup, setActiveGroup] = useState<GroupData | null>(null)
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const fetchUserGroups = useCallback(async () => {
    setIsLoadingGroups(true)
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      if (response.ok && data.groups) {
        setGroups(data.groups)
        if (data.groups.length === 0) {
          setNeedsOnboarding(true)
          setActiveGroup(null)
        } else {
          setNeedsOnboarding(false)
          setActiveGroup(previousActiveGroup => {
            if (previousActiveGroup) {
              const stillExistsInFetchedGroups = data.groups.find(
                (fetchedGroup: GroupData) => fetchedGroup.publicId === previousActiveGroup.publicId
              )
              return stillExistsInFetchedGroups || data.groups[0]
            }
            return data.groups[0]
          })
        }
      }
    } catch (fetchError) {
      console.error('Failed to fetch groups:', fetchError)
    } finally {
      setIsLoadingGroups(false)
    }
  }, [])

  useEffect(() => {
    fetchUserGroups()
  }, [fetchUserGroups])

  const setActiveGroupByPublicId = useCallback((publicId: string) => {
    const selectedGroup = groups.find(group => group.publicId === publicId)
    if (selectedGroup) setActiveGroup(selectedGroup)
  }, [groups])

  const groupMembersList: GroupMember[] = activeGroup
    ? activeGroup.members.map(memberWithRole => memberWithRole.user)
    : []

  const activeGroupPublicId = activeGroup?.publicId ?? null

  return (
    <GroupContext.Provider value={{
      activeGroup,
      groups,
      groupMembersList,
      activeGroupPublicId,
      needsOnboarding,
      isLoadingGroups,
      refreshGroups: fetchUserGroups,
      setActiveGroupByPublicId,
    }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroupContext() {
  const context = useContext(GroupContext)
  if (!context) throw new Error('useGroupContext must be used within GroupProvider')
  return context
}
