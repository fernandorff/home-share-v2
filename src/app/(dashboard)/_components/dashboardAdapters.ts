import type { Expense as ApiExpense } from '@/features/grupos/types'
import type { SimplifiedDebt } from '@/lib/balance'
import type { BalanceSummary, Expense as UiExpense, Resident, ResidentRole } from './dashboardMocks'

/**
 * Pure adapters mapping the server API payload to the UI-facing types used by
 * the dashboard primitives. Keeping this at the page boundary lets the visual
 * components stay decoupled from server shapes (decimals vs cents, user
 * publicId vs id, etc.).
 */

const MONTH_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

/** Consistent, deterministic accent colors so the same user keeps the same hue. */
const ACCENT_HUES = [38, 75, 155, 240, 300, 195, 18, 55]

function accentForUser(userId: number): string {
  const hue = ACCENT_HUES[userId % ACCENT_HUES.length]
  return `oklch(0.72 0.14 ${hue})`
}

function initialsFor(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/)
  const firstChar = first.charAt(0)
  const secondChar = second.charAt(0) || first.charAt(1) || ''
  return (firstChar + secondChar).toUpperCase() || '??'
}

export interface ApiMember {
  readonly role: 'ADMIN' | 'MEMBER'
  readonly user: {
    readonly id: number
    readonly publicId: string
    readonly name: string
    readonly isGuest?: boolean
  }
}

export function toResident(member: ApiMember): Resident {
  const role: ResidentRole = member.user.isGuest ? 'GUEST' : member.role
  return {
    id: member.user.publicId,
    name: member.user.name,
    role,
    accent: accentForUser(member.user.id),
    initials: initialsFor(member.user.name),
  }
}

export function toResidents(members: ReadonlyArray<ApiMember>): Resident[] {
  return members.map(toResident)
}

export function toUiExpense(
  apiExpense: ApiExpense,
  residentByUserId: Readonly<Record<number, Resident>>,
): UiExpense {
  const resident = residentByUserId[apiExpense.payerId]
  return {
    id: apiExpense.publicId,
    date: apiExpense.date.slice(0, 10),
    description: apiExpense.description,
    payerId: resident?.id ?? String(apiExpense.payerId),
    platform: apiExpense.platform?.name ?? '—',
    amountCents: Math.round(Number(apiExpense.amount) * 100),
    category: inferCategory(apiExpense.description),
  }
}

export function toUiExpenses(
  apiExpenses: ReadonlyArray<ApiExpense>,
  residents: ReadonlyArray<Resident>,
): UiExpense[] {
  const byUserId: Record<number, Resident> = {}
  for (const apiExpense of apiExpenses) {
    const match = residents.find((r) => r.id === apiExpense.payer.publicId)
    if (match) byUserId[apiExpense.payerId] = match
  }
  return apiExpenses.map((e) => toUiExpense(e, byUserId))
}

export function toBalanceSummary(settlements: ReadonlyArray<SimplifiedDebt>): BalanceSummary | null {
  const primary = settlements[0]
  if (!primary) return null
  return {
    debtorName: primary.from.name,
    creditorName: primary.to.name,
    amountCents: Math.round(primary.amount * 100),
    period: MONTH_PT[new Date().getMonth()] ?? '',
  }
}

/**
 * Heuristic classifier used until expenses carry a real category field.
 * Matches common platform/description keywords in Portuguese so mock data
 * looks reasonable without a user choice.
 */
function inferCategory(description: string): UiExpense['category'] {
  const d = description.toLowerCase()
  if (/netflix|spotify|streaming|assinatura/.test(d)) return 'Digital'
  if (/ração|pet|veterinár/.test(d))                  return 'Pets'
  if (/luz|água|internet|energia|gás|conta/.test(d))  return 'Contas'
  if (/jantar|bar|cinema|viagem|lazer/.test(d))       return 'Lazer'
  return 'Casa'
}
