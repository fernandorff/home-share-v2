import { formatCurrency } from '@/lib/currency'
import type { Expense, Resident } from './dashboardMocks'

interface ExpensesByPersonViewProps {
  expenses: ReadonlyArray<Expense>
  residents: ReadonlyArray<Resident>
}

/** Groups expenses by payer. One card per resident with their subtotal. */
export function ExpensesByPersonView({ expenses, residents }: ExpensesByPersonViewProps) {
  const grouped = groupByResident(expenses, residents)

  if (grouped.length === 0) {
    return (
      <div
        className="px-6 py-8 text-center text-[13.5px]"
        style={{ color: 'var(--cozy-fg-muted)' }}
      >
        Nenhum morador registrou despesas ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {grouped.map(({ resident, expenses: personExpenses, subtotalCents }) => (
        <ResidentGroup
          key={resident.id}
          resident={resident}
          expenses={personExpenses}
          subtotalCents={subtotalCents}
        />
      ))}
    </div>
  )
}

interface ResidentGroupProps {
  resident: Resident
  expenses: ReadonlyArray<Expense>
  subtotalCents: number
}

function ResidentGroup({ resident, expenses, subtotalCents }: ResidentGroupProps) {
  return (
    <article
      className="overflow-hidden rounded-xl border"
      style={{
        background: 'rgba(255, 255, 255, 0.65)',
        borderColor: 'var(--cozy-border-hair)',
      }}
    >
      <header
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--cozy-border-hair)' }}
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: resident.accent }}
          />
          <span
            className="font-display text-[14px] font-bold"
            style={{ color: 'var(--cozy-fg-primary)' }}
          >
            {resident.name}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter"
            style={{
              background: 'oklch(0.90 0.055 78 / 0.5)',
              color: 'var(--amber-800)',
            }}
          >
            {expenses.length} {expenses.length === 1 ? 'despesa' : 'despesas'}
          </span>
        </div>
        <span
          className="font-mono text-[13.5px] font-bold"
          style={{ color: 'var(--terracotta-700)' }}
        >
          R$ {formatCurrency(subtotalCents / 100)}
        </span>
      </header>
      <ul className="divide-y" style={{ borderColor: 'var(--cozy-border-hair)' }}>
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderColor: 'var(--cozy-border-hair)' }}
          >
            <div className="min-w-0">
              <p
                className="truncate text-[13.5px] font-semibold"
                style={{ color: 'var(--cozy-fg-primary)' }}
              >
                {expense.description}
              </p>
              <p className="text-[11.5px]" style={{ color: 'var(--cozy-fg-muted)' }}>
                {expense.date} · {expense.platform}
              </p>
            </div>
            <span
              className="font-mono text-[13px]"
              style={{ color: 'var(--cozy-fg-secondary)' }}
            >
              R$ {formatCurrency(expense.amountCents / 100)}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}

interface ResidentGroupData {
  resident: Resident
  expenses: Expense[]
  subtotalCents: number
}

function groupByResident(
  expenses: ReadonlyArray<Expense>,
  residents: ReadonlyArray<Resident>,
): ResidentGroupData[] {
  const buckets = new Map<string, ResidentGroupData>()
  for (const resident of residents) {
    buckets.set(resident.id, { resident, expenses: [], subtotalCents: 0 })
  }
  for (const expense of expenses) {
    const bucket = buckets.get(expense.payerId)
    if (!bucket) continue
    bucket.expenses.push(expense)
    bucket.subtotalCents += expense.amountCents
  }
  return Array.from(buckets.values())
    .filter((bucket) => bucket.expenses.length > 0)
    .sort((a, b) => b.subtotalCents - a.subtotalCents)
}
