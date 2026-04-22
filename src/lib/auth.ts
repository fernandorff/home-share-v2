import { currentUser, auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { uuidv7 } from '@/lib/uuid'

export async function getAuthUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  let user = await prisma.user.findUnique({ where: { clerkId } })

  if (!user) {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    user = await prisma.user.create({
      data: {
        publicId: uuidv7(),
        clerkId,
        name: clerkUser.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
          : clerkUser.emailAddresses[0]?.emailAddress ?? 'User',
        email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
      },
    })
  }

  return user
}

export async function requireAuthUser() {
  const user = await getAuthUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireGroupMember(userId: number, groupId: number) {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  })
  if (!membership) throw new Error('Not a member of this group')
  return membership
}
