import { NextResponse } from 'next/server'
import { requireAuthUser } from '@/lib/auth'
import { invitationService } from '@/services/invitation.service'
import { handleApiError } from '@/lib/api-helpers'

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token: invitationToken } = await params
    const authenticatedUser = await requireAuthUser()
    const acceptedGroup = await invitationService.accept(invitationToken, authenticatedUser.id)
    return NextResponse.json({ group: acceptedGroup })
  } catch (error) {
    return handleApiError(error, 'Erro ao aceitar convite')
  }
}
