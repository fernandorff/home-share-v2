"use client"

import { useGroupContext } from '@/contexts/group-context'

export interface GroupMemberForDisplay {
  id: number
  publicId: string
  name: string
  isGuest: boolean
}

export function useGroupMembers() {
  const { groupMembersList, activeGroupPublicId } = useGroupContext()

  return {
    members: groupMembersList as GroupMemberForDisplay[],
    memberIds: groupMembersList.map(member => member.id),
    activeGroupPublicId,
  }
}
