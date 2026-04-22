import { formatCurrency } from '@/lib/currency'
import type { Expense, Resident } from './dashboardMocks'

interface ExpensesListProps {
  expenses: ReadonlyArray<Expense>
  residents: ReadonlyArray<Resident>
}

const SHORT_MONTH = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** Mobile expense list — card-per-expense with date tile and category chip. */
export function ExpensesList({ expenses, residents }: ExpensesListProps) {
  const residentsById = Object.fromEntries(residents.map((r) => [r.id, r]))
  return (
    <ul className="space-y-3 px-4 pb-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          payer={residentsById[expense.payerId]}
        />
      ))}
    </ul>
  )
}

function ExpenseCard({ expense, payer }: { expense: Expense; payer?: Resident }) {
  const { month, day } = splitDate(expense.date)
  return (
    <li
      className="flex items-center gap-3 rounded-2xl border p-3"
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        borderColor: 'var(--cozy-border-subtle)',
      }}
    >
      <DateTile month={month} day={day} />
      <div className="min-w-0 flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="truncate font-sans text-[13.5px] font-bold"
            style={{ color: 'var(--cozy-fg-primary)' }}
          >
            {expense.description}
          </h3>
          <span
            className="flex-shrink-0 font-mono text-[13px] font-bold"
            style={{ color: 'var(--terracotta-700)' }}
          >
            R$ {formatCurrency(expense.amountCents / 100)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {payer && (
            <span className="flex items-center gap-1">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: payer.accent }}
              />
              <span className="text-[11.5px]" style={{ color: 'var(--cozy-fg-muted)' }}>
                {payer.name}
              </span>
            </span>
          )}
          <CategoryChip label={expense.category} />
        </div>
      </div>
    </li>
  )
}

function DateTile({ month, day }: { month: string; day: string }) {
  return (
    <div
      className="flex min-w-[48px] flex-col items-center justify-center rounded-lg border py-1"
      style={{
        background: 'var(--cozy-surface-raised)',
        borderColor: 'var(--cozy-border-subtle)',
        boxShadow: 'var(--cozy-shadow-xs)',
      }}
    >
      <span
        className="text-[9.5px] font-bold uppercase tracking-wider"
        style={{ color: 'var(--amber-600)' }}
      >
        {month}
      </span>
      <span
        className="font-display text-[17px] font-bold leading-none"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        {day}
      </span>
    </div>
  )
}

function CategoryChip({ label }: { label: Expense['category'] }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-tighter"
      style={{
        background: 'oklch(0.90 0.055 78 / 0.55)',
        color: 'var(--amber-800)',
      }}
    >
      {label}
    </span>
  )
}

function splitDate(iso: string): { month: string; day: string } {
  const [, month, day] = iso.split('-').map(Number)
  return {
    month: SHORT_MONTH[(month ?? 1) - 1],
    day: String(day).padStart(2, '0'),
  }
}
